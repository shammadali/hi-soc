import * as React from "react";
import * as ReactDOM from "react-dom";
import * as cn from "classnames";

import "./Magnifier.scss";


export interface MagnifierProps {
    enabled: boolean;
    width: string;
    height: string;
    scale: number;
}

export class Magnifier extends React.Component<MagnifierProps, void> {
    private wrap: HTMLElement;
    private lense: HTMLElement;
    private inner: HTMLElement;

    public onMouseMove = (event: MouseEvent) => {
        const offsetX = event.offsetX - parseFloat(this.props.width) / 2;
        const offsetY = event.offsetY - parseFloat(this.props.height) / 2;

        this.lense.style.left = `${offsetX}px`;
        this.lense.style.top = `${offsetY}px`;

        this.inner.style.transform = `
            translate(
                -${offsetX * this.props.scale + parseFloat(this.props.width) / 2}px,
                -${offsetY * this.props.scale + parseFloat(this.props.height) / 2}px
            )
            scale(${this.props.scale})
        `;
    }

    public componentWillReceiveProps(props: MagnifierProps): void {
        const section = document.querySelector(".chart-container");

        section[props.enabled ? "addEventListener" : "removeEventListener"]("mousemove", this.onMouseMove);
    }

    public componentDidMount(): void {
        this.wrap = ReactDOM.findDOMNode(this) as HTMLElement;
        this.lense = this.wrap.querySelector(".magnifier__lense") as HTMLElement;
        this.inner = this.lense.querySelector(".magnifier__lense-inner") as HTMLElement;
    }

    public render(): React.ReactElement<MagnifierProps> {
        return (
            <div className="magnifier__wrap">
                {this.props.children}
                <div className={cn("magnifier__lense", { "active": this.props.enabled })}
                     style={{
                         width: this.props.width,
                         height: this.props.height
                     }}>
                    <div className="magnifier__lense-inner">
                        {this.props.children}
                    </div>
                </div>
            </div>
        );
    }
}