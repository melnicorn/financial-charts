import { Annotate } from "../../../../../src";
import Annotated from "./Annotated";
import LabelBackground from "./LabelBackground";

export default {
    component: Annotate,
    title: "Features/Annotate",
};

export const labels = () => <Annotated labelAnnotation />;

export const paths = () => <Annotated svgAnnotation />;

export const labelBackground = () => <LabelBackground />;
