import { functor, GenericChartComponent } from "../core";
import { format } from "d3-format";
import * as React from "react";
import { ToolTipText } from "./ToolTipText";
import { ToolTipTSpanLabel } from "./ToolTipTSpanLabel";

import {
    TooltipCommonProps,
    defaultTooltipCommonProps,
    generateTooltipBackgroundValues,
} from "./TooltipCommon";

export interface StochasticTooltipProps extends TooltipCommonProps {
    readonly origin: [number, number] | ((width: number, height: number) => [number, number]);
    readonly labelFill?: string;
    readonly yAccessor: (currentItem: any) => { K: number; D: number };
    readonly options: {
        windowSize: number;
        kWindowSize: number;
        dWindowSize: number;
    };
    readonly appearance: {
        stroke: {
            dLine: string;
            kLine: string;
        };
    };
    readonly displayFormat: (value: number) => string;
    readonly displayInit?: string;
    readonly displayValuesFor?: (props: StochasticTooltipProps, moreProps: any) => any;
    readonly label: string;
}

export class StochasticTooltip extends React.Component<StochasticTooltipProps> {
    public static defaultProps = {
        ...defaultTooltipCommonProps,
        className: "react-financial-charts-tooltip",
        displayFormat: format(".2f"),
        displayInit: "n/a",
        displayValuesFor: (_: any, props: any) => props.currentItem,
        label: "STO",
        origin: [0, 0],
    };

    public render() {
        return <GenericChartComponent clip={false} svgDraw={this.renderSVG} drawOn={["mousemove"]} />;
    }

    private readonly renderSVG = (moreProps: any) => {
        const {
            onClick,
            fontFamily,
            fontSize = StochasticTooltip.defaultProps.fontSize,
            fontWeight,
            yAccessor,
            displayFormat,
            origin: originProp,
            label,
            className,
            displayInit,
            displayValuesFor = StochasticTooltip.defaultProps.displayValuesFor,
            options,
            appearance,
            labelFill,
            background,
        } = this.props;
        const {
            chartConfig: { width, height },
            fullData,
        } = moreProps;

        const currentItem = displayValuesFor(this.props, moreProps) ?? fullData[fullData.length - 1];

        const stochastic = currentItem && yAccessor(currentItem);

        const K = (stochastic?.K && displayFormat(stochastic.K)) ?? displayInit;
        const D = (stochastic?.D && displayFormat(stochastic.D)) ?? displayInit;

        const origin = functor(originProp);

        const [x, y] = origin(width, height);

        const { stroke } = appearance;

        return (
            <g className={className} transform={`translate(${x}, ${y})`} onClick={onClick}>
                {generateTooltipBackgroundValues(
                    fontSize,
                    `${label} %K(${options.windowSize}, ${options.kWindowSize}): ${K} %D (${options.dWindowSize}): ${D}`,
                    background,
                ) && (
                        <rect
                            {...generateTooltipBackgroundValues(
                                fontSize,
                                `${label} %K(${options.windowSize}, ${options.kWindowSize}): ${K} %D (${options.dWindowSize}): ${D}`,
                                background,
                            )}
                        />
                    )}
                <ToolTipText x={0} y={0} fontFamily={fontFamily} fontSize={fontSize} fontWeight={fontWeight}>
                    <ToolTipTSpanLabel fill={labelFill}>{`${label} %K(`}</ToolTipTSpanLabel>
                    <tspan fill={stroke.kLine}>{`${options.windowSize}, ${options.kWindowSize}`}</tspan>
                    <ToolTipTSpanLabel fill={labelFill}>): </ToolTipTSpanLabel>
                    <tspan fill={stroke.kLine}>{K}</tspan>
                    <ToolTipTSpanLabel fill={labelFill}> %D (</ToolTipTSpanLabel>
                    <tspan fill={stroke.dLine}>{options.dWindowSize}</tspan>
                    <ToolTipTSpanLabel fill={labelFill}>): </ToolTipTSpanLabel>
                    <tspan fill={stroke.dLine}>{D}</tspan>
                </ToolTipText>
            </g>
        );
    };
}
