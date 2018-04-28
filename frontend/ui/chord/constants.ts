import { attributeHierarchy } from "@frontend/attribute-tree";

export const initialChordSize = 1000;
export const firstArcThickness = 20;
export const arcThickness = 10;

export function getAttributes(): string[] {
    const attributes: string[] = Object.keys(attributeHierarchy)
        .reduce((accumulator: string[], attrKey: string) => accumulator.concat(attributeHierarchy[attrKey].children), []);
    attributes.push("attribute-type");
    return attributes;
}

export const attributeClasses = getAttributes().map(attr => `.group.${attr}`).join(", ");