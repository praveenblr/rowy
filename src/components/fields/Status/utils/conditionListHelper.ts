export function createValueLabel(condition) {
  const { operator, type, value } = condition || {};
  const typeLabelMap = new Map([
    ["undefined", `${type}`], // currently undefined value is returning null need to fix that
    ["null", `${type}`],
    ["number", ` ${type}:${operator}${value}`],
    ["boolean", `${type}:${value}`],
  ]);
  const string = typeLabelMap.get(type);
  const validString = Boolean(typeof string === "string");
  return validString ? string : JSON.stringify(value);
}
