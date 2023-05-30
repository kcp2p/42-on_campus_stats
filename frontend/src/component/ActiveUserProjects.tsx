import React, { useEffect, useState } from "react";
import Card from "./Card";
import CardTitle from "./CardTitle";
import * as d3 from "d3";
import "../styles/chart.css";
import axios from "axios";
import { UPDATE_TIME } from "../constant/global";
import useChartDimensions from "../hooks/useChartDimension";
import clsx from "clsx";
// turn data object into array of objects
/*
Example :
dataset = [
  {
    project: "ft_container",
    user_num: 3,
    percentage: 0.8
  },
  {
    project: "NetPractice",
    user_num: 1,
    percentage: 0.1
  }
]
*/

type TDataType = {
  project: string;
  user_num: number;
  percentage: string;
};

type TApiDataType = {
  [key: string]: number;
};

function cleaningData(dataObj: TApiDataType) {
  let dataset: TDataType[] = [];
  let tots = 0;
  for (const d in dataObj) {
    dataset = [
      ...dataset,
      { project: d, user_num: dataObj[d], percentage: "" },
    ];
  }
  dataset = dataset.sort((a, b) => b["user_num"] - a["user_num"]).slice(0, 10);
  tots = d3.sum(dataset, (d) => d["user_num"]);
  dataset.forEach(
    (x) => (x.percentage = ((x.user_num / tots) * 100).toFixed(2) + "%")
  );
  return dataset;
}

// Function PieChart Plotting
function PieChart({
  projects,
  color,
  radius,
}: {
  projects: any;
  color: any;
  radius: number;
}) {
  const pie = d3.pie().value((d: any) => d["user_num"]);
  const arc = d3
    .arc()
    .innerRadius(0)
    .outerRadius(radius * 0.9);
  return (
    // transform={"translate(" + (radius + 40) + "," + (40 + radius) + ")"}
    <g transform={`translate(${radius + 40}, ${radius})`}>
      {pie(projects).map((d: any, i) => {
        return (
          <g className="arc" key={i}>
            <path fill={color(i)} d={arc(d)!}></path>
            <text
              className={clsx("text-xs fill-white")}
              style={{ textAnchor: "middle" }}
              transform={`translate(${arc.centroid(d)[0]}, ${
                arc.centroid(d)[1]
              })`}
            >
              {d.data.user_num}
            </text>
          </g>
        );
      })}
    </g>
  );
}

// Plot Chart Legends
function ChartLegends({
  projects,
  color,
  size,
  height,
}: {
  projects: TDataType[];
  color: any;
  size: number;
  height: number;
}): JSX.Element {
  // const legendMargin = 16 + 4;
  return (
    <g transform={`translate(${size * 2.2},${height * 0.25})`}>
      {projects.map(({ project }: { project: string }, i: number) => (
        <g key={i}>
          <circle
            // className="legend-dots "
            cx="2rem"
            cy={`${1.25 * i}rem`}
            r="5"
            fill={color(i)}
          ></circle>
          <text
            className="text-sm"
            x="2.75rem"
            y={`${1.25 * i + 0.25}rem`}
            style={{ fill: "#f3f4f6" }}
          >
            {project}
          </text>
        </g>
      ))}
    </g>
  );
}

// Component for Active User Projects in Campus
export default function ActiveUserProjects() {
  const [projects, setProjects] = React.useState<TDataType[] | undefined>(
    undefined
  );
  const color = d3.scaleOrdinal(d3.schemeTableau10);
  const [ref, dimension] = useChartDimensions({
    marginLeft: 16,
    marginRight: 16,
  });
  const size = dimension.width * 0.9;
  // const size = (dimension.width / 3) * 2;
  const radius = size / Math.PI;

  // This is TO FETCH DATA FROM API
  useEffect(() => {
    const fetchProjects = async () => {
      await axios
        .get("/on-campus/active-user-projects")
        .then((res) => {
          setProjects(cleaningData(res.data));
        })
        .catch((err) => {
          console.log(err);
        });
    };
    fetchProjects();
    const interval = setInterval(fetchProjects, UPDATE_TIME);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card ref={ref}>
      <CardTitle>Active User Projects</CardTitle>
      {projects ? (
        <svg
          className="pie-chart-svg"
          width={dimension.width}
          height={(dimension.width / 16) * 9}
        >
          <PieChart projects={projects} color={color} radius={radius} />
          <ChartLegends
            projects={projects}
            color={color}
            size={radius}
            height={(dimension.width / 16) * 9}
          />
        </svg>
      ) : (
        <div
          className={`bg-gray-500 rounded animate-pulse w-[${dimension.width}rem] h-[${dimension.width}rem] `}
          style={{
            width: `${dimension.width}px`,
            height: `${(dimension.width / 16) * 9}px`,
          }}
        ></div>
      )}
    </Card>
  );
}
