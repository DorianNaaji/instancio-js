import * as ts from 'typescript';

/**
 * A specialized transformer for instancio-js that extracts type information
 * and injects it into Instancio.of<T>() calls.
 */
export default function (program: ts.Program) {
  const checker = program.getTypeChecker();

  return (context: ts.TransformationContext) => {
    const visit: ts.Visitor = (node) => {
      if (ts.isCallExpression(node)) {
        const expression = node.expression;
        if (ts.isPropertyAccessExpression(expression)) {
          const obj = expression.expression;
          const method = expression.name;

          if (ts.isIdentifier(obj) && obj.text === 'Instancio') {
            if (method.text === 'of' || method.text === 'ofArray' || method.text === 'ofSet') {
              const typeNode = node.typeArguments?.[0];
              if (typeNode) {
                const type = checker.getTypeFromTypeNode(typeNode);
                const schema = serializeType(type, checker);
                const schemaLiteral = schemaToLiteral(schema);

                if (method.text === 'of') {
                  return ts.factory.updateCallExpression(node, node.expression, node.typeArguments, [schemaLiteral]);
                } else {
                  const sizeArg = node.arguments[0] || ts.factory.createNumericLiteral(0);
                  return ts.factory.updateCallExpression(node, node.expression, node.typeArguments, [
                    sizeArg,
                    schemaLiteral,
                  ]);
                }
              }
            }
          }
        }
      }
      return ts.visitEachChild(node, visit, context);
    };

    return (sourceFile: ts.SourceFile) => ts.visitNode(sourceFile, visit) as ts.SourceFile;
  };
}

function serializeType(type: ts.Type, checker: ts.TypeChecker, seen: Set<ts.Type> = new Set()): any {
  if (seen.has(type)) {
    return { kind: 'any', name: 'RecursiveReference' };
  }
  seen.add(type);

  const flags = type.getFlags();

  // Primitives
  if (flags & ts.TypeFlags.String) return { kind: 'string' };
  if (flags & ts.TypeFlags.Number) return { kind: 'number' };
  if (flags & ts.TypeFlags.Boolean) return { kind: 'boolean' };
  if (flags & ts.TypeFlags.BigInt) return { kind: 'bigint' };
  if (flags & ts.TypeFlags.Null) return { kind: 'null' };
  if (flags & ts.TypeFlags.Undefined) return { kind: 'undefined' };
  if (flags & ts.TypeFlags.Any) return { kind: 'any' };
  if (flags & ts.TypeFlags.Void) return { kind: 'undefined' };

  // Important: handle ESSymbol as string to match old instancio-js behavior for 'symbol' primitive
  if (flags & ts.TypeFlags.ESSymbol || flags & ts.TypeFlags.UniqueESSymbol) return { kind: 'string' };

  // Date/Symbol interface check
  const symbol = type.getSymbol();
  const symbolName = symbol?.getName();
  if (symbolName === 'Date') return { kind: 'date' };
  if (symbolName === 'Symbol') return { kind: 'symbol' };

  if (type.isUnion()) {
    return { kind: 'union', types: type.types.map((t) => serializeType(t, checker, new Set(seen))) };
  }

  // Tuple
  if (checker.isTupleType(type)) {
    const elementTypes = (type as ts.TypeReference).typeArguments || [];
    return { kind: 'tuple', elements: elementTypes.map((t) => serializeType(t, checker, new Set(seen))) };
  }

  // Array
  if (checker.isArrayType(type)) {
    const elementType = (type as ts.TypeReference).typeArguments?.[0];
    return {
      kind: 'array',
      elementType: elementType ? serializeType(elementType, checker, new Set(seen)) : { kind: 'any' },
    };
  }

  // Enum
  if (flags & ts.TypeFlags.Enum || flags & ts.TypeFlags.EnumLiteral) {
    const enumSymbol = type.getSymbol() || type.aliasSymbol;
    if (enumSymbol) {
      const values: any[] = [];
      enumSymbol.exports?.forEach((valueSymbol) => {
        const valueDeclaration = valueSymbol.valueDeclaration as ts.EnumMember;
        if (valueDeclaration) {
          values.push({ name: valueSymbol.name, value: checker.getConstantValue(valueDeclaration) });
        }
      });

      if (values.length > 0) {
        return { kind: 'enum', values };
      }
    }
  }

  // Literals
  if (type.isStringLiteral()) return { kind: 'literal', value: type.value };
  if (type.isNumberLiteral()) return { kind: 'literal', value: type.value };

  // Object/Interface/Class - Move this to the end to avoid catching arrays/tuples
  if (flags & ts.TypeFlags.Object) {
    const properties = checker.getPropertiesOfType(type);
    const props = properties
      .filter((p) => {
        // Filter out methods
        const declaration = p.valueDeclaration;
        return !declaration || (!ts.isMethodDeclaration(declaration) && !ts.isMethodSignature(declaration));
      })
      .map((p) => {
        const propType = p.valueDeclaration
          ? checker.getTypeOfSymbolAtLocation(p, p.valueDeclaration)
          : checker.getAnyType();
        return {
          name: p.getName(),
          schema: serializeType(propType, checker, new Set(seen)),
          optional: (p.flags & ts.SymbolFlags.Optional) !== 0,
        };
      });
    return { kind: 'object', properties: props };
  }

  return { kind: 'any' };
}

function schemaToLiteral(schema: any): ts.Expression {
  if (schema === null) return ts.factory.createNull();
  if (schema === undefined) return ts.factory.createIdentifier('undefined');
  if (typeof schema === 'string') return ts.factory.createStringLiteral(schema);
  if (typeof schema === 'number') return ts.factory.createNumericLiteral(schema);
  if (typeof schema === 'boolean') return schema ? ts.factory.createTrue() : ts.factory.createFalse();
  if (typeof schema === 'bigint') return ts.factory.createBigIntLiteral(schema.toString() + 'n');

  if (Array.isArray(schema)) {
    return ts.factory.createArrayLiteralExpression(schema.map(schemaToLiteral));
  }
  if (typeof schema === 'object') {
    const properties = Object.entries(schema).map(([key, value]) => {
      return ts.factory.createPropertyAssignment(ts.factory.createIdentifier(key), schemaToLiteral(value));
    });
    return ts.factory.createObjectLiteralExpression(properties);
  }
  return ts.factory.createIdentifier('undefined');
}
