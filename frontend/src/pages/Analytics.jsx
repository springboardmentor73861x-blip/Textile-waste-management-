import { useEffect, useState } from "react";

import {
    FaChartLine,
    FaRecycle,
    FaWater,
    FaLeaf,
    FaCloud,
    FaTrash,
    FaArrowLeft
} from "react-icons/fa";

import { Link } from "react-router-dom";

import {
    getSustainabilitySummary
} from "../services/Api";

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from "recharts";

import "./Analytics.css";


function Analytics() {

    const [data, setData] = useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    useEffect(() => {

        loadAnalytics();

    }, []);


    const loadAnalytics = async () => {

        try {

            setLoading(true);

            setError("");

            const result =
                await getSustainabilitySummary();

            setData(result);

        } catch (err) {

            console.error(
                "Analytics error:",
                err
            );

            setError(
                "Unable to load analytics data."
            );

        } finally {

            setLoading(false);

        }

    };


    if (loading) {

        return (

            <div className="analytics-page">

                <div className="analytics-loading">

                    <FaChartLine />

                    <h2>
                        Loading Analytics...
                    </h2>

                    <p>
                        Fetching sustainability intelligence.
                    </p>

                </div>

            </div>

        );

    }


    if (error) {

        return (

            <div className="analytics-page">

                <div className="analytics-error">

                    <h2>
                        Analytics Unavailable
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        onClick={loadAnalytics}
                    >
                        Try Again
                    </button>

                </div>

            </div>

        );

    }


    if (!data) {

        return null;

    }


    /* =========================================================
       MATERIAL DATA
    ========================================================= */

    const materialDistribution =
        data.material_distribution || {};


    const materialChartData =
        Object.entries(
            materialDistribution
        ).map(
            ([name, value]) => ({
                name,
                value: Number(value)
            })
        );


    /* =========================================================
       CIRCULARITY DATA
    ========================================================= */

    const circularityCategories =
        data.circularity_categories || {};


    const circularityChartData =
        Object.entries(
            circularityCategories
        ).map(
            ([name, value]) => ({
                name,
                value: Number(value)
            })
        );


    /* =========================================================
       RECOVERY DATA
    ========================================================= */

    const totalWaste =
        Number(
            data.total_quantity || 0
        );


    const recoveredWaste =
        Number(
            data.total_recovered_quantity || 0
        );


    const unrecoveredWaste =
        Math.max(
            totalWaste -
            recoveredWaste,
            0
        );


    const recoveryChartData = [

        {
            name: "Total Waste",
            value: totalWaste
        },

        {
            name: "Recovered",
            value: recoveredWaste
        },

        {
            name: "Remaining",
            value: unrecoveredWaste
        }

    ];


    /* =========================================================
       ENVIRONMENTAL DATA
    ========================================================= */

    const environmentalChartData = [

        {
            name: "CO₂ Savings",
            value:
                Number(
                    data.total_co2_savings || 0
                )
        },

        {
            name: "Landfill Reduction",
            value:
                Number(
                    data.total_landfill_reduction || 0
                )
        }

    ];


    const PIE_COLORS = [

        "#22c55e",

        "#4ade80",

        "#16a34a",

        "#86efac",

        "#15803d"

    ];


    return (

        <div className="analytics-page">


            {/* =====================================================
                HEADER
            ===================================================== */}

            <div className="analytics-header">

                <div>

                    <h1>

                        <FaChartLine />

                        Executive Analytics

                    </h1>

                    <p>

                        Textile waste intelligence,
                        recovery performance and
                        sustainability insights.

                    </p>

                </div>


                <Link
                    to="/dashboard"
                    className="analytics-back-button"
                >

                    <FaArrowLeft />

                    Back to Dashboard

                </Link>

            </div>


            {/* =====================================================
                KPI CARDS
            ===================================================== */}

            <div className="analytics-stats">


                <div className="analytics-stat-card">

                    <div className="analytics-stat-icon">

                        <FaTrash />

                    </div>

                    <span>
                        Total Waste
                    </span>

                    <strong>
                        {totalWaste} kg
                    </strong>

                </div>


                <div className="analytics-stat-card">

                    <div className="analytics-stat-icon">

                        <FaRecycle />

                    </div>

                    <span>
                        Recovered Material
                    </span>

                    <strong>
                        {recoveredWaste} kg
                    </strong>

                </div>


                <div className="analytics-stat-card">

                    <div className="analytics-stat-icon">

                        <FaCloud />

                    </div>

                    <span>
                        CO₂ Savings
                    </span>

                    <strong>
                        {data.total_co2_savings || 0} kg
                    </strong>

                </div>


                <div className="analytics-stat-card">

                    <div className="analytics-stat-icon">

                        <FaWater />

                    </div>

                    <span>
                        Water Savings
                    </span>

                    <strong>
                        {(
                            data.total_water_savings || 0
                        ).toLocaleString()} L
                    </strong>

                </div>


                <div className="analytics-stat-card">

                    <div className="analytics-stat-icon">

                        <FaLeaf />

                    </div>

                    <span>
                        Waste Diversion
                    </span>

                    <strong>
                        {data.waste_diversion_rate || 0}%
                    </strong>

                </div>


                <div className="analytics-stat-card">

                    <div className="analytics-stat-icon">

                        <FaRecycle />

                    </div>

                    <span>
                        Circularity Score
                    </span>

                    <strong>
                        {data.average_circularity_score || 0}%
                    </strong>

                </div>

            </div>


            {/* =====================================================
                CHART ROW 1
            ===================================================== */}

            <div className="charts-grid">


                {/* MATERIAL DISTRIBUTION */}

                <div className="analytics-panel chart-panel">

                    <div className="panel-heading">

                        <h2>
                            Material Distribution
                        </h2>

                        <span>
                            Textile waste by material
                        </span>

                    </div>


                    <div className="chart-container">

                        <ResponsiveContainer
                            width="100%"
                            height={320}
                        >

                            <PieChart>

                                <Pie
                                    data={materialChartData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={105}
                                    dataKey="value"
                                    nameKey="name"
                                    label
                                >

                                    {materialChartData.map(
                                        (_, index) => (

                                            <Cell
                                                key={
                                                    `material-${index}`
                                                }
                                                fill={
                                                    PIE_COLORS[
                                                        index %
                                                        PIE_COLORS.length
                                                    ]
                                                }
                                            />

                                        )
                                    )}

                                </Pie>


                                <Tooltip
                                    contentStyle={{
                                        background:
                                            "#172033",

                                        border:
                                            "1px solid rgba(255,255,255,0.2)",

                                        borderRadius:
                                            "10px",

                                        color:
                                            "#ffffff"
                                    }}
                                />


                                <Legend />

                            </PieChart>

                        </ResponsiveContainer>

                    </div>

                </div>


                {/* CIRCULARITY */}

                <div className="analytics-panel chart-panel">

                    <div className="panel-heading">

                        <h2>
                            Circularity Categories
                        </h2>

                        <span>
                            Recovery potential
                        </span>

                    </div>


                    <div className="chart-container">

                        <ResponsiveContainer
                            width="100%"
                            height={320}
                        >

                            <PieChart>

                                <Pie
                                    data={circularityChartData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={105}
                                    dataKey="value"
                                    nameKey="name"
                                    label
                                >

                                    {circularityChartData.map(
                                        (_, index) => (

                                            <Cell
                                                key={
                                                    `circularity-${index}`
                                                }
                                                fill={
                                                    PIE_COLORS[
                                                        index %
                                                        PIE_COLORS.length
                                                    ]
                                                }
                                            />

                                        )
                                    )}

                                </Pie>


                                <Tooltip
                                    contentStyle={{
                                        background:
                                            "#172033",

                                        border:
                                            "1px solid rgba(255,255,255,0.2)",

                                        borderRadius:
                                            "10px",

                                        color:
                                            "#ffffff"
                                    }}
                                />


                                <Legend />

                            </PieChart>

                        </ResponsiveContainer>

                    </div>

                </div>

            </div>


            {/* =====================================================
                RECOVERY PERFORMANCE
            ===================================================== */}

            <div className="analytics-panel chart-panel">


                <div className="panel-heading">

                    <h2>
                        Recovery Performance
                    </h2>

                    <span>
                        Total, recovered and remaining material
                    </span>

                </div>


                <div className="chart-container recovery-chart">

                    <ResponsiveContainer
                        width="100%"
                        height={330}
                    >

                        <BarChart
                            data={recoveryChartData}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 10,
                                bottom: 20
                            }}
                        >

                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="rgba(255,255,255,0.12)"
                            />

                            <XAxis
                                dataKey="name"
                                stroke="#cbd5e1"
                            />

                            <YAxis
                                stroke="#cbd5e1"
                            />

                            <Tooltip
                                contentStyle={{
                                    background:
                                        "#172033",

                                    border:
                                        "1px solid rgba(255,255,255,0.2)",

                                    borderRadius:
                                        "10px",

                                    color:
                                        "#ffffff"
                                }}
                            />

                            <Bar
                                dataKey="value"
                                radius={[
                                    8,
                                    8,
                                    0,
                                    0
                                ]}
                                fill="#22c55e"
                            />

                        </BarChart>

                    </ResponsiveContainer>

                </div>

            </div>


            {/* =====================================================
                ENVIRONMENTAL IMPACT
            ===================================================== */}

            <div className="analytics-panel chart-panel">


                <div className="panel-heading">

                    <h2>
                        Environmental Impact
                    </h2>

                    <span>
                        CO₂ savings and landfill reduction
                    </span>

                </div>


                <div className="chart-container">

                    <ResponsiveContainer
                        width="100%"
                        height={330}
                    >

                        <BarChart
                            data={
                                environmentalChartData
                            }
                            margin={{
                                top: 20,
                                right: 30,
                                left: 10,
                                bottom: 20
                            }}
                        >

                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="rgba(255,255,255,0.12)"
                            />

                            <XAxis
                                dataKey="name"
                                stroke="#cbd5e1"
                            />

                            <YAxis
                                stroke="#cbd5e1"
                            />

                            <Tooltip
                                contentStyle={{
                                    background:
                                        "#172033",

                                    border:
                                        "1px solid rgba(255,255,255,0.2)",

                                    borderRadius:
                                        "10px",

                                    color:
                                        "#ffffff"
                                }}
                            />

                            <Bar
                                dataKey="value"
                                radius={[
                                    8,
                                    8,
                                    0,
                                    0
                                ]}
                                fill="#4ade80"
                            />

                        </BarChart>

                    </ResponsiveContainer>

                </div>

            </div>


            {/* =====================================================
                ENVIRONMENTAL SUMMARY
            ===================================================== */}

            <div className="environment-grid">


                <div className="environment-card">

                    <FaCloud />

                    <span>
                        CO₂ Savings
                    </span>

                    <strong>
                        {data.total_co2_savings || 0} kg
                    </strong>

                </div>


                <div className="environment-card">

                    <FaWater />

                    <span>
                        Water Savings
                    </span>

                    <strong>
                        {(
                            data.total_water_savings || 0
                        ).toLocaleString()} L
                    </strong>

                </div>


                <div className="environment-card">

                    <FaTrash />

                    <span>
                        Landfill Reduction
                    </span>

                    <strong>
                        {data.total_landfill_reduction || 0} kg
                    </strong>

                </div>


                <div className="environment-card">

                    <FaRecycle />

                    <span>
                        Average Recyclability
                    </span>

                    <strong>
                        {data.average_recyclability_score || 0}%
                    </strong>

                </div>

            </div>


            {/* =====================================================
                FOOTER
            ===================================================== */}

            <div className="analytics-footer">

                <p>

                    Building a sustainable future
                    through intelligent textile
                    waste management.

                </p>

            </div>


        </div>

    );

}


export default Analytics;