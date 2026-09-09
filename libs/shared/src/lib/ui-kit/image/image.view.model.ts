type BaseImageViewModel = {
  path: string;
  priority: boolean;
};

type FillImage = BaseImageViewModel & {
  fill: true;
  width?: number | string; // px or %
  height?: number | string; // px or %
};

type FixedImage = BaseImageViewModel & {
  fill: false;
  width: number | string; // px or %
  height: number | string; // px or %
};

export type ImageViewModel = FillImage | FixedImage;
