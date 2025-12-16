import { GenericComponent, functor, ChartCanvasContext } from "../core";
import { ScaleContinuousNumeric } from "d3-scale";
import * as React from "react";

export interface LabelProps {
    readonly background?: {
        readonly fillStyle?: string | ((datum: any) => string);
        readonly padding?: number | { x: number; y: number } | { top?: number; bottom?: number; left?: number; right?: number };
    };
    readonly datum?: any;
    readonly fillStyle?: string | ((datum: any) => string);
    readonly fontFamily?: string;
    readonly fontSize?: number;
    readonly fontWeight?: string;
    readonly layer?: "bottom" | "top";
    readonly rotate?: number;
    readonly selectCanvas?: (canvases: any) => any;
    readonly text?: string | ((datum: any) => string);
    readonly textAlign?: CanvasTextAlign;
    readonly x:
    | number
    | ((xScale: ScaleContinuousNumeric<number, number>, xAccessor: any, datum: any, plotData: any[]) => number);
    readonly xAccessor?: (datum: any) => any;
    readonly xScale?: ScaleContinuousNumeric<number, number>;
    readonly y: number | ((yScale: ScaleContinuousNumeric<number, number>, datum: any, plotData: any[]) => number);
    readonly yScale?: ScaleContinuousNumeric<number, number>;
}

export class Label extends React.Component<LabelProps> {
    public static defaultProps = {
        fontFamily: "-apple-system, system-ui, Roboto, 'Helvetica Neue', Ubuntu, sans-serif",
        fontSize: 64,
        fontWeight: "bold",
        fillStyle: "#dcdcdc",
        rotate: 0,
        x: ({ xScale, xAccessor, datum }: any) => xScale(xAccessor(datum)),
    };

    public static contextType = ChartCanvasContext;

    public declare context: React.ContextType<typeof ChartCanvasContext>;

    public render() {
        const { selectCanvas, layer } = this.props;

        const canvasDraw =
            selectCanvas !== undefined
                ? selectCanvas
                : layer === "top"
                    ? (canvases: any) => canvases.axes
                    : (canvases: any) => canvases.bg;

        return <GenericComponent canvasToDraw={canvasDraw} canvasDraw={this.drawOnCanvas} drawOn={["pan"]} />;
    }

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps: any) => {
        ctx.save();

        const { textAlign = "center", fontFamily, fontSize = 64, fontWeight, rotate } = this.props;

        const { margin, ratio } = this.context;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(ratio, ratio);
        ctx.translate(margin.left + 0.5 * ratio, margin.top + 0.5 * ratio);

        const { xScale, chartConfig, xAccessor } = moreProps;

        const yScale = Array.isArray(chartConfig) || !chartConfig ? undefined : chartConfig.yScale;

        const { xPos, yPos, fillStyle, text, backgroundFillStyle, backgroundPadding } = this.helper(
            moreProps,
            xAccessor,
            xScale,
            yScale,
        );

        ctx.save();
        ctx.translate(xPos, yPos);
        if (rotate !== undefined) {
            const radians = (rotate / 180) * Math.PI;

            ctx.rotate(radians);
        }

        if (fontFamily !== undefined) {
            ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        }

        if (backgroundFillStyle !== undefined) {
            const { width } = ctx.measureText(text);
            const height = fontSize;

            let paddingLeft = 0;
            let paddingRight = 0;
            let paddingTop = 0;
            let paddingBottom = 0;

            if (backgroundPadding !== undefined) {
                if (typeof backgroundPadding === "number") {
                    paddingLeft = backgroundPadding;
                    paddingRight = backgroundPadding;
                    paddingTop = backgroundPadding;
                    paddingBottom = backgroundPadding;
                } else if ("x" in backgroundPadding || "y" in backgroundPadding) {
                    const { x = 0, y = 0 } = backgroundPadding as { x?: number; y?: number };
                    paddingLeft = x;
                    paddingRight = x;
                    paddingTop = y;
                    paddingBottom = y;
                } else {
                    const { left = 0, right = 0, top = 0, bottom = 0 } = backgroundPadding as {
                        top?: number;
                        bottom?: number;
                        left?: number;
                        right?: number;
                    };
                    paddingLeft = left;
                    paddingRight = right;
                    paddingTop = top;
                    paddingBottom = bottom;
                }
            }

            let x = 0;
            if (textAlign === "center" || textAlign === undefined) {
                x = -width / 2;
            } else if (textAlign === "right" || textAlign === "end") {
                x = -width;
            } else {
                x = 0;
            }

            const y = -height;

            ctx.fillStyle = backgroundFillStyle;
            ctx.fillRect(
                x - paddingLeft,
                y - paddingTop,
                width + paddingLeft + paddingRight,
                height + paddingTop + paddingBottom,
            );
        }

        if (fillStyle !== undefined) {
            ctx.fillStyle = fillStyle;
        }
        if (textAlign !== undefined) {
            ctx.textAlign = textAlign;
        }


        ctx.beginPath();
        ctx.fillText(text, 0, 0);
        ctx.restore();
    };

    private readonly helper = (
        moreProps: any,
        xAccessor: any,
        xScale: ScaleContinuousNumeric<number, number>,
        yScale: ScaleContinuousNumeric<number, number>,
    ) => {
        const { x, y, datum, fillStyle, text, background } = this.props;

        const { plotData } = moreProps;

        const xFunc = functor(x);
        const yFunc = functor(y);

        const [xPos, yPos] = [xFunc({ xScale, xAccessor, datum, plotData }), yFunc({ yScale, datum, plotData })];

        return {
            xPos,
            yPos,
            text: functor(text)(datum),
            fillStyle: functor(fillStyle)(datum),
            backgroundFillStyle: background !== undefined ? functor(background.fillStyle)(datum) : undefined,
            backgroundPadding: background !== undefined ? background.padding : undefined,
        };
    };
}
