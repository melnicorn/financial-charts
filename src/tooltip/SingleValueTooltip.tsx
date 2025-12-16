import { functor, identity, GenericChartComponent, noop, last } from "../core";
import { format } from "d3-format";
import * as React from "react";
import { ToolTipText } from "./ToolTipText";
import { ToolTipTSpanLabel } from "./ToolTipTSpanLabel";

import {
    TooltipCommonProps,
    defaultTooltipCommonProps,
    generateTooltipBackgroundValues,
} from "./TooltipCommon";

export interface SingleValueTooltipProps extends TooltipCommonProps {
    readonly xDisplayFormat?: (value: number) => string;
    readonly yDisplayFormat?: (value: number) => string;
    readonly xInitDisplay?: string;
    readonly yInitDisplay?: string;
    readonly xLabel?: string;
    readonly yLabel: string;
    readonly labelFill?: string;
    readonly labelFontWeight?: number;
    readonly valueFill?: string;
    readonly displayValuesFor?: (props: SingleValueTooltipProps, moreProps: any) => any;
    readonly xAccessor?: (d: any) => number;
    readonly yAccessor?: (d: any) => number;
}

export class SingleValueTooltip extends React.Component<SingleValueTooltipProps> {
    public static defaultProps = {
        ...defaultTooltipCommonProps,
        className: "react-financial-charts-tooltip",
        displayValuesFor: (_: any, props: any) => props.currentItem,
        labelFill: "#4682B4",
        origin: [0, 0],
        valueFill: "#000000",
        xAccessor: noop,
        xDisplayFormat: identity as (value: number) => string,
        xInitDisplay: "n/a",
        yAccessor: identity as (d: any) => number,
        yDisplayFormat: format(".2f") as (value: number) => string,
        yInitDisplay: "n/a",
    };

    public render() {
        return <GenericChartComponent clip={false} svgDraw={this.renderSVG} drawOn={["mousemove"]} />;
    }

    private readonly renderSVG = (moreProps: any) => {
        const {
            onClick,
            fontFamily,
            fontSize = SingleValueTooltip.defaultProps.fontSize,
            fontWeight,
            labelFill,
            labelFontWeight,
            valueFill,
            className,
            displayValuesFor = SingleValueTooltip.defaultProps.displayValuesFor,
            origin: originProp,
            xDisplayFormat = SingleValueTooltip.defaultProps.xDisplayFormat,
            yDisplayFormat = SingleValueTooltip.defaultProps.yDisplayFormat,
            xLabel,
            yLabel,
            xAccessor = SingleValueTooltip.defaultProps.xAccessor,
            yAccessor = SingleValueTooltip.defaultProps.yAccessor,
            xInitDisplay,
            yInitDisplay,
            background,
        } = this.props;

        const {
            chartConfig: { width, height },
            fullData,
        } = moreProps;

        const currentItem = displayValuesFor(this.props, moreProps) ?? last(fullData);

        let xDisplayValue = xInitDisplay;
        let yDisplayValue = yInitDisplay;
        if (currentItem !== undefined) {
            const xItem = xAccessor(currentItem);
            if (xItem !== undefined) {
                xDisplayValue = xDisplayFormat(xItem);
            }

            const yItem = yAccessor(currentItem);
            if (yItem !== undefined) {
                yDisplayValue = yDisplayFormat(yItem);
            }
        }

        const origin = functor(originProp);

        const [x, y] = origin(width, height);

        return (
            <g className={className} transform={`translate(${x}, ${y})`} onClick={onClick}>
                {generateTooltipBackgroundValues(
                    fontSize,
                    `${xLabel ? xLabel + ": " + xDisplayValue + " " : ""}${yLabel} ${yDisplayValue}`,
                    background,
                ) && (
                        <rect
                            {...generateTooltipBackgroundValues(
                                fontSize,
                                `${xLabel ? xLabel + ": " + xDisplayValue + " " : ""}${yLabel} ${yDisplayValue}`,
                                background,
                            )}
                        />
                    )}
                <ToolTipText x={0} y={0} fontFamily={fontFamily} fontSize={fontSize} fontWeight={fontWeight}>
                    {xLabel ? (
                        <ToolTipTSpanLabel x={0} dy="5" fill={labelFill}>{`${xLabel}: `}</ToolTipTSpanLabel>
                    ) : null}
                    {xLabel ? <tspan fill={valueFill}>{`${xDisplayValue} `}</tspan> : null}
                    <ToolTipTSpanLabel fill={labelFill} fontWeight={labelFontWeight}>{`${yLabel} `}</ToolTipTSpanLabel>
                    <tspan fill={valueFill}>{yDisplayValue}</tspan>
                </ToolTipText>
            </g>
        );
    };
}
