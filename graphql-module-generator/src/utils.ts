const scalars = ['String', 'Int', 'Boolean', 'Float', 'Date'];

export function onlyUnique(value: any, index: number, self: any) {
    return self.indexOf(value) === index;
}

export function getQueryItem(schemaTree: any): any {
    return schemaTree.filter((item: any) => item.name === 'Query')?.[0];
}

export function getMutationItem(schemaTree: any): any {
    return schemaTree.filter((item: any) => item.name === 'Mutation')?.[0];
}

export function stringTypeMatch(type: string, ...patterns: string[]): boolean {
    for (let pattern of patterns) {
        if (type === pattern)
            return true;
    }

    return false;
}

export function typeMatch(field: any, ...patterns: string[]): boolean {
    for (let type of field?.types)
        if (stringTypeMatch(type, ...patterns))
            return true;

    return false;
}

export function getTrueType(field: any): string {
    return field.types[field.types.length - 1]
}

export function isScalarType(type: string): boolean {
    return stringTypeMatch(type, ...scalars);
}

export function isScalarField(field: any): boolean {
    return typeMatch(field, ...scalars);
}

export function isListField(field: any): boolean {
    return typeMatch(field, 'ListType');
}

export function isNonNullField(field: any): boolean {
    return typeMatch(field, 'NonNullType');
}
