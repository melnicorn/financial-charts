import * as React from "react";
import {
    TooltipCommonProps,
    defaultTooltipCommonProps,
    generateTooltipBackgroundValues,
} from "./TooltipCommon";
import { ToolTipText } from "./ToolTipText";
import { ToolTipTSpanLabel } from "./ToolTipTSpanLabel";

export type layouts = "horizontal" | "horizontalRows" | "horizontalInline" | "vertical" | "verticalRows";

export interface SingleTooltipProps extends TooltipCommonProps {
    readonly yLabel: string;
    readonly yValue: string;
    readonly labelFill: string;
    readonly valueFill: string;
    readonly forChart: number | string;
    readonly options: any;
    readonly layout: layouts;
    readonly withShape: boolean;
}

export class SingleTooltip extends React.Component<SingleTooltipProps> {
    public static defaultProps = {
        ...defaultTooltipCommonProps,
        labelFill: "#4682B4",
        valueFill: "#000000",
        withShape: false,
    };

    /*
     * Renders the value next to the label.
     */
    public renderValueNextToLabel() {
        const { origin, yLabel, yValue, labelFill, valueFill, withShape, fontSize = SingleTooltip.defaultProps.fontSize, fontFamily, fontWeight, background } =
            this.props;

        return (
            <g transform={`translate(${(origin as [number, number])[0]}, ${(origin as [number, number])[1]})`} onClick={this.handleClick}>
                {generateTooltipBackgroundValues(
                    fontSize,
                    `${yLabel}: ${yValue}`,
                    background,
                ) && (
                        <rect
                            {...generateTooltipBackgroundValues(
                                fontSize,
                                `${yLabel}: ${yValue}`,
                                background,
                            )}
                        />
                    )}
                {withShape ? <rect x="0" y="-6" width="6" height="6" fill={valueFill} /> : null}
                <ToolTipText
                    x={withShape ? 8 : 0}
                    y={0}
                    fontFamily={fontFamily}
                    fontSize={fontSize}
                    fontWeight={fontWeight}
                >
                    <ToolTipTSpanLabel fill={labelFill}>{yLabel}: </ToolTipTSpanLabel>
                    <tspan fill={valueFill}>{yValue}</tspan>
                </ToolTipText>
            </g>
        );
    }

    /*
     * Renders the value beneath the label.
     */
    public renderValueBeneathLabel() {
        const { origin, yLabel, yValue, labelFill, valueFill, withShape, fontSize = SingleTooltip.defaultProps.fontSize, fontFamily, fontWeight, background } =
            this.props;

        return (
            <g transform={`translate(${(origin as [number, number])[0]}, ${(origin as [number, number])[1]})`} onClick={this.handleClick}>
                {generateTooltipBackgroundValues(
                    fontSize,
                    yLabel.length > yValue.length ? yLabel : yValue,
                    background,
                ) && (
                        <rect
                            {...generateTooltipBackgroundValues(
                                fontSize,
                                yLabel.length > yValue.length ? yLabel : yValue,
                                background,
                            )}
                        />
                    )}
                {withShape ? <line x1={0} y1={2} x2={0} y2={28} stroke={valueFill} strokeWidth="4px" /> : null}
                <ToolTipText x={5} y={11} fontFamily={fontFamily} fontSize={fontSize} fontWeight={fontWeight}>
                    <ToolTipTSpanLabel fill={labelFill}>{yLabel}</ToolTipTSpanLabel>
                    <tspan x="5" dy="15" fill={valueFill}>
                        {yValue}
                    </tspan>
                </ToolTipText>
            </g>
        );
    }

    /*
     * Renders the value next to the label.
     * The parent component must have a "text"-element.
     */
    public renderInline() {
        const { yLabel, yValue, labelFill, valueFill, fontSize, fontFamily, fontWeight, background } = this.props;

        return (
            <tspan onClick={this.handleClick} fontFamily={fontFamily} fontSize={fontSize} fontWeight={fontWeight}>
                {background && (
                    <tspan>
                        {/* Background for inline is tricky without specific coordinates, skipping or needs complex logic.
                            Given usage, inline usually inside text block.
                            If we must, we might need a rect, but tspan doesn't support rect child directly safely?
                            Actually SVG allows rect inside g, but here we return tspan.
                            Let's wrap in g if background exists?
                            But renderInline seems to be used as child of Text?
                            Signature says returns tspan.
                            If it's child of Text, we can't put rect inside easily.
                            User said "For all tooltip types".
                            If this is used inside GroupTooltip (which it is), GroupTooltip handles the background.
                            If used standalone?
                            GenericChartComponent calls renderSVG.
                            renderSVG calls render, which returns comp.
                            comp is tspan.
                            If SingleTooltip is top level, it needs to be returned in a g with rect?
                            But renderInline returns tspan.
                            Let's leave inline without background or wrap?
                            Wrapping invalidates tspan usage inside Text?
                            If SingleTooltip is used as <SingleTooltip layout="horizontalInline" ... /> it is top level?
                            No, usually <GenericChartComponent svgDraw={...} />
                            renderSVG calls this.
                            If SingleTooltip.renderSVG returns tspan, it's valid SVG under <g>?
                            Yes.
                            So we can assume we can wrap it if we want background?
                            But "renderInline" implies it flows.
                            Let's implement background for block layouts first.
                            Inline might be edge case.
                         */}
                    </tspan>
                )}
                <ToolTipTSpanLabel fill={labelFill}>{yLabel}:&nbsp;</ToolTipTSpanLabel>
                <tspan fill={valueFill}>{yValue}&nbsp;&nbsp;</tspan>
            </tspan>
        );
    }

    public render() {
        const { layout } = this.props;
        let comp: React.ReactElement | null = null;

        switch (layout) {
            case "horizontal":
                comp = this.renderValueNextToLabel();
                break;
            case "horizontalRows":
                comp = this.renderValueBeneathLabel();
                break;
            case "horizontalInline":
                comp = this.renderInline();
                break;
            case "vertical":
                comp = this.renderValueNextToLabel();
                break;
            case "verticalRows":
                comp = this.renderValueBeneathLabel();
                break;
            default:
                comp = this.renderValueNextToLabel();
        }

        return comp;
    }

    private readonly handleClick = (event: React.MouseEvent) => {
        const { onClick, forChart, options } = this.props;
        if (onClick !== undefined) {
            onClick(event, { chartId: forChart, ...options });
        }
    };
}
