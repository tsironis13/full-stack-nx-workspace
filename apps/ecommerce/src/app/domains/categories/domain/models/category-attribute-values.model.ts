export type CategoryAttributeValues = {
  attributeId: number;
  attributeName: string;
  values: CategoryAttributeValue[];
}[];

export type CategoryAttributeValue = {
  valueId: number;
  valueName: string;
};
