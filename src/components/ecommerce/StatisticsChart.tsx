import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import ChartTab, { PeriodType } from "../common/ChartTab";
import { AVC09Service } from "../../services";

interface ExtendedLeavesStats {
  year: number;
  extended_leaves_monthly_count: number[];
}

const aggregateToQuarterly = (monthlyData: number[]): number[] => {
  // Trimestre 1: Ene, Feb, Mar (índices 0, 1, 2)
  const Q1 = monthlyData[0] + monthlyData[1] + monthlyData[2];
  // Trimestre 2: Abr, May, Jun (índices 3, 4, 5)
  const Q2 = monthlyData[3] + monthlyData[4] + monthlyData[5];
  // Trimestre 3: Jul, Ago, Sep (índices 6, 7, 8)
  const Q3 = monthlyData[6] + monthlyData[7] + monthlyData[8];
  // Trimestre 4: Oct, Nov, Dic (índices 9, 10, 11)
  const Q4 = monthlyData[9] + monthlyData[10] + monthlyData[11];

  return [Q1, Q2, Q3, Q4];
};

// Función para agregar datos mensuales a anuales
const aggregateToAnnually = (monthlyData: number[]): number[] => {
  const annualTotal = monthlyData.reduce((sum, count) => sum + count, 0);
  return [annualTotal];
};

export default function StatisticsChart() {
  const [statsData, setStatsData] = useState<ExtendedLeavesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("monthly");
  const rawMonthlyData = statsData?.extended_leaves_monthly_count || [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ];
  const currentYear = statsData?.year || new Date().getFullYear();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await AVC09Service.getStatics();

        setStatsData(response.data);
      } catch (e) {
        if (axios.isAxiosError(e)) {
          const errorMessage = e.response
            ? `Error ${e.response.status}: ${e.response.statusText}`
            : e.message;
          setError(`Error al obtener datos: ${errorMessage}`);
        } else {
          setError("Ocurrió un error desconocido.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // NOTE: useMemo para recalcular los datos del gráfico SÓLO si cambian rawMonthlyData o selectedPeriod
  const { chartData, chartCategories, chartTitleSuffix } = useMemo(() => {
    let data: number[] = [];
    let categories: string[] = [];
    let titleSuffix = "";

    switch (selectedPeriod) {
      case "monthly":
        data = rawMonthlyData;
        categories = [
          "Ene",
          "Feb",
          "Mar",
          "Abr",
          "May",
          "Jun",
          "Jul",
          "Ago",
          "Sep",
          "Oct",
          "Nov",
          "Dic",
        ];
        titleSuffix = `Mes (${currentYear})`;
        break;
      case "quarterly":
        data = aggregateToQuarterly(rawMonthlyData);
        categories = ["T1", "T2", "T3", "T4"];
        titleSuffix = `Trimestre (${currentYear})`;
        break;
      case "annually":
        data = aggregateToAnnually(rawMonthlyData);
        categories = [`${currentYear}`];
        titleSuffix = `Anual (${currentYear})`;
        break;
    }

    return {
      chartData: data,
      chartCategories: categories,
      chartTitleSuffix: titleSuffix,
    };
  }, [rawMonthlyData, selectedPeriod, currentYear]);

  const series = [
    {
      name: `Bajas Extendidas - ${chartTitleSuffix}`,
      data: chartData,
    },
  ];

  // 3. Opciones de ApexCharts (se actualiza el eje X)
  const options: ApexOptions = {
    legend: { show: false, position: "top", horizontalAlign: "left" },
    colors: ["#465FFF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "line",
      toolbar: { show: false },
    },
    stroke: { curve: "straight", width: [2] },
    fill: { type: "gradient", gradient: { opacityFrom: 0.55, opacityTo: 0 } },
    markers: {
      size: 4,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: { size: 6 },
    },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    dataLabels: { enabled: false },
    tooltip: {
      enabled: true,
      x: { formatter: (val) => val },
    },
    xaxis: {
      type: "category",
      categories: chartCategories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: {
      labels: {
        style: { fontSize: "12px", colors: ["#6B7280"] },
      },
      title: { text: "N° Bajas", style: { fontSize: "12px" } }, // Título opcional
    },
  };

  // 4. Renderizado condicional
  if (loading) return <p>Cargando estadísticas...</p>;
  if (error)
    return (
      <p className="text-red-600">Error al cargar estadísticas: {error}</p>
    );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Estadísticas de Bajas Extendidas
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Conteo agrupado por **{selectedPeriod}** para el año **{currentYear}
            **
          </p>
        </div>
        <div className="flex items-start w-full gap-3 sm:justify-end">
          {/* Se pasa la función para actualizar el estado */}
          <ChartTab onSelectPeriod={setSelectedPeriod} />
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] xl:min-w-full">
          <Chart options={options} series={series} type="area" height={310} />
        </div>
      </div>
    </div>
  );
}
