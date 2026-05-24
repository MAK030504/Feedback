const escapeCell = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value).replaceAll('"', '""');
  return /[",\n]/.test(stringValue) ? `"${stringValue}"` : stringValue;
};

export const toCsv = (rows, headers) => {
  const headerRow = headers.map((header) => escapeCell(header.label)).join(",");
  const bodyRows = rows.map((row) =>
    headers.map((header) => escapeCell(row[header.key])).join(","),
  );

  return [headerRow, ...bodyRows].join("\n");
};
