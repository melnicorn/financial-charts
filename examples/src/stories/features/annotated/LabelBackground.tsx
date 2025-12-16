
import * as React from "react";
import {
  ema,
  discontinuousTimeScaleProviderBuilder,
  CandlestickSeries,
  Chart,
  ChartCanvas,
  Label,
  XAxis,
  YAxis,
  withDeviceRatio,
  withSize,
} from "../../../../../src";
import { IOHLCData, withOHLCData } from "../../../data";

interface ChartProps {
  readonly data: IOHLCData[];
  readonly height: number;
  readonly ratio: number;
  readonly width: number;
}

class LabelBackground extends React.Component<ChartProps> {
  private readonly margin = { left: 0, right: 48, top: 0, bottom: 24 };
  private readonly xScaleProvider = discontinuousTimeScaleProviderBuilder().inputDateAccessor(
    (d: IOHLCData) => d.date,
  );

  public render() {
    const { data: initialData, height, ratio, width } = this.props;

    const ema12 = ema()
      .id(1)
      .options({ windowSize: 12 })
      .merge((d: any, c: any) => {
        d.ema12 = c;
      })
      .accessor((d: any) => d.ema12);

    const calculatedData = ema12(initialData);

    const { data, xScale, xAccessor, displayXAccessor } = this.xScaleProvider(calculatedData);

    const max = xAccessor(data[data.length - 1]);
    const min = xAccessor(data[Math.max(0, data.length - 100)]);
    const xExtents = [min, max];

    return (
      <ChartCanvas
        height={height}
        ratio={ratio}
        width={width}
        margin={this.margin}
        data={data}
        displayXAccessor={displayXAccessor}
        seriesName="Data"
        xScale={xScale}
        xAccessor={xAccessor}
        xExtents={xExtents}
      >
        <Chart id={1} yExtents={this.yExtents}>
          <XAxis showGridLines />
          <YAxis showGridLines />
          <CandlestickSeries />
          <Label
            x={(width - this.margin.right) / 2}
            y={height / 2}
            text="Label with Background"
            fillStyle="black"
            background={{
              fillStyle: "#FFD700",
              padding: 10,
            }}
            fontSize={20}
          />
          <Label
            x={(width - this.margin.right) / 2}
            y={(height / 2) + 50}
            text="Label with X/Y Padding"
            fillStyle="black"
            background={{
              fillStyle: "#90EE90",
              padding: { x: 20, y: 5 },
            }}
            fontSize={20}
          />
          <Label
            x={(width - this.margin.right) / 2}
            y={(height / 2) + 100}
            text="Label without Background"
            fillStyle="black"
            fontSize={20}
          />
          <Label
            x={(width - this.margin.right) / 2}
            y={150}
            text="Behind Candles"
            fillStyle="white"
            background={{ fillStyle: "black", padding: 5 }}
            fontSize={16}
            layer="bottom"
          />
          <Label
            x={(width - this.margin.right) / 2}
            y={200}
            text="In Front of Candles"
            fillStyle="white"
            background={{ fillStyle: "black", padding: 5 }}
            fontSize={16}
            layer="top"
          />
        </Chart>
      </ChartCanvas>
    );
  }

  private readonly yExtents = (data: IOHLCData) => {
    return [data.high, data.low];
  };
}

export default withOHLCData()(withSize({ style: { minHeight: 600 } })(withDeviceRatio()(LabelBackground)));
