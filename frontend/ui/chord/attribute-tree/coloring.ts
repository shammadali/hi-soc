import { ColorCommonInstance, cubehelix, CubehelixColor, HCLColor, HSLColor, LabColor, RGBColor } from "d3";

export class ColorInterpolator {
    private color: CubehelixColor;

    public constructor(color:
        string
        | CubehelixColor
        | RGBColor
        | HSLColor
        | LabColor
        | HCLColor
        | ColorCommonInstance) {
        if (typeof color === "string") {
            this.color = cubehelix(color);
        } else {
            this.color = cubehelix(color);
        }
    }

    public levelUp(): ColorInterpolator {
        return new ColorInterpolator(this.color.brighter(1.4));
    }

    public at(index: number): string {
        return this.color.toString();
    }
}