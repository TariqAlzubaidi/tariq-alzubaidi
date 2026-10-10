// Smoke test for the deployed static Projects section.
import { readFileSync, statSync } from "node:fs";
import { Script } from "node:vm";
import assert from "node:assert/strict";

const html = readFileSync("dist/index.html", "utf8");
const match = (begin, end) => {
  const a = html.indexOf(begin);
  const b = html.indexOf(end, a + begin.length);
  assert(a >= 0 && b > a, `Missing expected section: ${begin}`);
  return html.slice(a, b);
};

for (const [, body] of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)) {
  if (body.trim()) new Script(body, { filename: "dist/index.html inline script" });
}

const projectData = match("var PROJECTS=", "var FUTURE=");
const projects = new Function(projectData + "\nreturn PROJECTS;")();
assert.equal(projects.length, 3);
const excel = projects.find(p => p.slug === "employee-data-analysis");
const powerbi = projects.find(p => p.slug === "hr-recruitment-dashboard");
assert(excel?.study?.excel && powerbi?.study && !powerbi.study.excel);
assert.equal(excel.study.shots.length, 4);
assert.equal(excel.study.download, "./employee-data-case-study/Employee_Data_Analysis.xlsx");

let cardHtml = "";
function $(id) {
  assert.equal(id, "#featured");
  return { set innerHTML(value) { cardHtml = value; } };
}
const escape = (value) => String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
const projectRender = match('$("#featured").innerHTML=PROJECTS.map(', '$("#futureGrid").innerHTML=');
new Function("PROJECTS", "$", "esc", projectRender)(projects, $, escape);
const cards = cardHtml.split('<article class="card project ').slice(1);
assert.equal(cards.length, 3, "Expected three project cards");
assert(cards[0].includes('href="./hr-dashboard.html"'), "Power BI link must open Power BI");
assert(cards[0].includes('href="#/project/hr-recruitment-dashboard"'));
assert(cards[1].includes('href="#/project/employee-data-analysis"'), "Excel Explore must open Excel case study");
assert(cards[1].includes('href="./employee-data-case-study/Employee_Data_Analysis.xlsx"'));
assert(!cards[1].includes("hr-dashboard.html"), "Excel card must not link to Power BI");
assert(!cards[2].includes("hr-dashboard.html"), "In-progress card must not link to Power BI");

for (const name of [
  "hr-dashboard.png", "employee-data.png", "headcount-analysis.png",
  "salary-analysis.png", "Employee_Data_Analysis.xlsx",
]) {
  const file = `dist/employee-data-case-study/${name}`;
  assert(statSync(file).size > 100, `Missing/empty asset: ${file}`);
}
console.log("Projects verification passed: distinct links, valid script, four screenshots, Excel workbook.");
