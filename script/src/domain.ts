export interface ProjectCollection {
  meta: Meta;
  projects: Project[];
}

export interface ImageCollection {
  projectId: number;
  images: Image[];
}

export interface ImageCroppedCollection {
  imagePath: string;
  link: string;
  shapes: Shape[];
}

export interface Shape {
  label: string;
  points: Point[];
}

export interface Meta {
  count: number;
  vienna: Vienna;
}

export interface Project {
  projectId: number;
  name: string;
  form: {
    formParts: FormPart[];
  };
}

export interface Image {
  originalName: string;
  externalLink: string;
  desc: string;
}

export interface CroppedImage {
  originalName: string;
  externalLink: string;
  croppedLabels: Label[];
  deleteLabels: Label[];
}

export interface Label {
  type: string;
  points: Point[];
}

export interface Point {
  location: Location[];
}

export interface Location {
  lng: number;
  lat: number;
}

export interface MetaProject {
  meta: Meta;
  images: Image[];
}

export interface Vienna {
  main: string;
  mid?: string;
  sub?: string;
  extra?: "A" | "K";
  desc?: string;
}

export interface FormPart {
  id: string;
  name: string;
  type: "bbox" | "polygon";
}

export interface Kipris {
  [key: string]: KiprisData[];
}

export interface KiprisData {
  applicationCode: string;
  link: string;
}
