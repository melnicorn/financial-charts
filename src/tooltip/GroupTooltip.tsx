import { GenericChartComponent, last } from "../core";
import { format } from "d3-format";
import * as React from "react";
import { layouts, SingleTooltip } from "./SingleTooltip";
import { ToolTipText } from "./ToolTipText";

import {
    TooltipCommonProps,
    defaultTooltipCommonProps,
    generateTooltipBackgroundValues,
} from "./TooltipCommon";

export interface GroupTooltipProps extends TooltipCommonProps {
    readonly displayFormat: (value: number) => string;
    readonly displayInit?: string;
    readonly displayValuesFor: (props: GroupTooltipProps, moreProps: any) => any;
    readonly layout: layouts;
    readonly onClick?: (event: React.MouseEvent, details: any) => void;
    readonly options: {
        labelFill?: string;
        yLabel: string;
        yAccessor: (data: any) => number;
        valueFill?: string;
        withShape?: boolean;
        displayFormat?: (value: number) => string;
    }[];
    readonly position?: "topRight" | "bottomLeft" | "bottomRight";
    readonly verticalSize?: number; // "verticalSize" only be used, if layout is "vertical", "verticalRows".
    readonly width?: number; // "width" only be used, if layout is "horizontal" or "horizontalRows".
}

export class GroupTooltip extends React.Component<GroupTooltipProps> {
    public static defaultProps = {
        ...defaultTooltipCommonProps,
        className: "react-financial-charts-tooltip react-financial-charts-group-tooltip",
        layout: "horizontal",
        displayFormat: format(".2f"),
        displayInit: "",
        displayValuesFor: (_: any, props: any) => props.currentItem,
        width: 60,
        verticalSize: 13,
    };

    public render() {
        return <GenericChartComponent clip={false} svgDraw={this.renderSVG} drawOn={["mousemove"]} />;
    }

    private readonly getPosition = (moreProps: any) => {
        const { position } = this.props;
        const { height, width } = moreProps.chartConfig;

        const dx = 20;
        const dy = 40;
        let textAnchor: string | undefined;
        let xyPos: (number | null)[] | null = null;

        if (position !== undefined) {
            switch (position) {
                case "topRight":
                    xyPos = [width - dx, null];
                    textAnchor = "end";
                    break;
                case "bottomLeft":
                    xyPos = [null, height - dy];
                    break;
                case "bottomRight":
                    xyPos = [width - dx, height - dy];
                    textAnchor = "end";
                    break;
                default:
                    xyPos = [null, null];
            }
        } else {
            xyPos = [null, null];
        }

        return { xyPos, textAnchor };
    };

    private readonly renderSVG = (moreProps: any) => {
        const { chartId, fullData } = moreProps;

        const {
            className,
            displayInit = GroupTooltip.defaultProps.displayInit,
            displayValuesFor,
            onClick,
            width = 60,
            verticalSize = 13,
            fontFamily,
            fontSize = GroupTooltip.defaultProps.fontSize,
            fontWeight,
            layout,
            origin: originProp,
            displayFormat,
            options,
            background,
        } = this.props;

        const currentItem = displayValuesFor(this.props, moreProps) ?? last(fullData);

        const { xyPos, textAnchor } = this.getPosition(moreProps);

        const xPos = xyPos != null && xyPos[0] != null ? xyPos[0] : (originProp as [number, number])[0];
        const yPos = xyPos != null && xyPos[1] != null ? xyPos[1] : (originProp as [number, number])[1];

        const singleTooltip = options.map((each, idx) => {
            const yValue = currentItem && each.yAccessor(currentItem);
            const yDisplayValue = yValue ? (each.displayFormat ? each.displayFormat(yValue) : displayFormat(yValue)) : displayInit;

            const orig: () => [number, number] = () => {
                if (layout === "horizontal" || layout === "horizontalRows") {
                    return [width * idx, 0];
                }
                if (layout === "vertical") {
                    return [0, verticalSize * idx];
                }
                if (layout === "verticalRows") {
                    return [0, verticalSize * 2.3 * idx];
                }
                return [0, 0];
            };

            return (
                <SingleTooltip
                    key={idx}
                    layout={layout}
                    origin={orig()}
                    yLabel={each.yLabel}
                    yValue={yDisplayValue}
                    options={each}
                    forChart={chartId}
                    onClick={onClick}
                    fontFamily={fontFamily}
                    fontSize={fontSize}
                    labelFill={each.labelFill}
                    valueFill={each.valueFill}
                    withShape={each.withShape}
                />
            );
        });

        return (
            <g transform={`translate(${xPos}, ${yPos})`} className={className} textAnchor={textAnchor}>
                {generateTooltipBackgroundValues(fontSize, null, background) && (
                    // GroupTooltip has complex sizing logic based on layout.
                    // Helper might be too simple.
                    // "Calculated if not provided".
                    // The helper as defined: if width undefined, calculates from content.
                    // GroupTooltip content is not simple string.
                    // If we pass null content, calculating width = 0.
                    // So we must pass explicit dimensions to helper if we want to use helper for rect props generation?
                    // Or update helper?
                    // User said "Consolidate this to a helper method".
                    // The helper returns an object.
                    // We can reuse the object structure but we need custom width/height logic here.
                    // So we can still call helper but maybe pass pre-calculated width/height in a temp object?
                    // Or just use the helper for the structure and consistency, but override width/height?
                    // Let's pass null content and then override width/height in properties.
                    // Actually, if we pass null content, width is 0.
                    // If we pass an object to background arg of helper, it respects it.
                    // So we can construct the "background" config with the dynamic width/height and pass it to helper.
                    <rect
                        {...generateTooltipBackgroundValues(fontSize, null, {
                            ...background,
                            x: background?.x ?? 0,
                            y: background?.y ?? -fontSize - 2,
                            width:
                                background?.width ??
                                (layout === "horizontal" || layout === "horizontalRows" || layout === "horizontalInline"
                                    ? width * options.length + 10
                                    : 150),
                            height:
                                background?.height ??
                                (layout === "horizontal" || layout === "horizontalInline"
                                    ? fontSize * 1.5
                                    : layout === "horizontalRows"
                                        ? fontSize * 2.5
                                        : layout === "vertical"
                                            ? verticalSize * options.length + 10
                                            : verticalSize * 2.3 * options.length + 10),
                        })}
                    />
                )}
                {layout === "horizontalInline" ? (
                    <ToolTipText x={0} y={0} fontFamily={fontFamily} fontSize={fontSize} fontWeight={fontWeight}>
                        {singleTooltip}
                    </ToolTipText>
                ) : (
                    singleTooltip
                )}
            </g>
        );
    };
}
