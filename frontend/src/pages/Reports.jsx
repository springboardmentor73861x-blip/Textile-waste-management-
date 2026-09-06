import { useEffect, useState } from "react";

import {
    FaArrowLeft,
    FaFileAlt,
    FaRecycle,
    FaLeaf,
    FaCloud,
    FaDownload,
    FaChartLine,
    FaWater,
    FaTrash
} from "react-icons/fa";

import { Link } from "react-router-dom";

import {
    getWasteReport,
    getSustainabilityReport,
    getRecyclingReport,
    getEnvironmentalReport
} from "../services/Api";

import "./Reports.css";


function Reports() {

    const [wasteReport, setWasteReport] =
        useState(null);

    const [sustainabilityReport, setSustainabilityReport] =
        useState(null);

    const [recyclingReport, setRecyclingReport] =
        useState(null);

    const [environmentalReport, setEnvironmentalReport] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    useEffect(() => {

        loadReports();

    }, []);


    const loadReports = async () => {

        try {

            setLoading(true);

            setError("");

            const [
                waste,
                sustainability,
                recycling,
                environmental
            ] = await Promise.all([

                getWasteReport(),

                getSustainabilityReport(),

                getRecyclingReport(),

                getEnvironmentalReport()

            ]);


            setWasteReport(waste);

            setSustainabilityReport(
                sustainability
            );

            setRecyclingReport(
                recycling
            );

            setEnvironmentalReport(
                environmental
            );


        } catch (err) {

            console.error(
                "Reports error:",
                err
            );

            setError(
                "Unable to load reports."
            );

        } finally {

            setLoading(false);

        }

    };


    const downloadCSV = async () => {

        try {

            const token =
                localStorage.getItem(
                    "token"
                );


            const response = await fetch(
                "/api/reports/export/csv",
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


            if (!response.ok) {

                throw new Error(
                    "CSV download failed"
                );

            }


            const blob =
                await response.blob();


            const url =
                window.URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement("a");


            link.href = url;

            link.download =
                "waste_report.csv";

            document.body.appendChild(
                link
            );

            link.click();

            link.remove();

            window.URL.revokeObjectURL(
                url
            );


        } catch (err) {

            console.error(
                "CSV error:",
                err
            );

            alert(
                "Unable to download CSV report."
            );

        }

    };


    if (loading) {

        return (

            <div className="reports-page">

                <div className="reports-loading">

                    <FaFileAlt />

                    <h2>
                        Loading Reports...
                    </h2>

                    <p>
                        Preparing your project reports.
                    </p>

                </div>

            </div>

        );

    }


    if (error) {

        return (

            <div className="reports-page">

                <div className="reports-error">

                    <h2>
                        Reports Unavailable
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        onClick={loadReports}
                    >
                        Try Again
                    </button>

                </div>

            </div>

        );

    }


    const summary =
        sustainabilityReport?.summary || {};


    const environmental =
        environmentalReport?.environmental_impact
        || {};


    return (

        <div className="reports-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="reports-header">

                <div>

                    <h1>

                        <FaFileAlt />

                        Reports & Insights

                    </h1>

                    <p>

                        Generate and review textile
                        waste management reports.

                    </p>

                </div>


                <Link
                    to="/dashboard"
                    className="reports-back-button"
                >

                    <FaArrowLeft />

                    Back to Dashboard

                </Link>

            </div>


            {/* =================================================
                SUMMARY
            ================================================= */}

            <div className="reports-summary">

                <div className="report-summary-card">

                    <FaTrash />

                    <span>
                        Total Waste
                    </span>

                    <strong>
                        {summary.total_quantity || 0} kg
                    </strong>

                </div>


                <div className="report-summary-card">

                    <FaRecycle />

                    <span>
                        Recovered
                    </span>

                    <strong>
                        {summary.total_recovered_quantity || 0} kg
                    </strong>

                </div>


                <div className="report-summary-card">

                    <FaLeaf />

                    <span>
                        Diversion Rate
                    </span>

                    <strong>
                        {summary.waste_diversion_rate || 0}%
                    </strong>

                </div>


                <div className="report-summary-card">

                    <FaCloud />

                    <span>
                        CO₂ Savings
                    </span>

                    <strong>
                        {environmental.total_co2_savings || 0} kg
                    </strong>

                </div>

            </div>


            {/* =================================================
                REPORT CARDS
            ================================================= */}

            <div className="reports-grid">


                {/* WASTE REPORT */}

                <div className="report-card">

                    <div className="report-icon">

                        <FaFileAlt />

                    </div>

                    <h2>
                        Waste Management Report
                    </h2>

                    <p>
                        Complete overview of registered
                        textile waste records.
                    </p>


                    <div className="report-details">

                        <span>
                            Records
                        </span>

                        <strong>
                            {wasteReport?.total_records || 0}
                        </strong>

                    </div>


                    <div className="report-details">

                        <span>
                            Materials
                        </span>

                        <strong>

                            {
                                Object.keys(
                                    summary.material_distribution
                                    || {}
                                ).length
                            }

                        </strong>

                    </div>

                </div>


                {/* SUSTAINABILITY REPORT */}

                <div className="report-card">

                    <div className="report-icon">

                        <FaLeaf />

                    </div>

                    <h2>
                        Sustainability Report
                    </h2>

                    <p>
                        Circularity, recovery and
                        sustainability performance.
                    </p>


                    <div className="report-details">

                        <span>
                            Circularity Score
                        </span>

                        <strong>
                            {
                                summary.average_circularity_score
                                || 0
                            }%
                        </strong>

                    </div>


                    <div className="report-details">

                        <span>
                            Recyclability
                        </span>

                        <strong>
                            {
                                summary.average_recyclability_score
                                || 0
                            }%
                        </strong>

                    </div>

                </div>


                {/* RECYCLING REPORT */}

                <div className="report-card">

                    <div className="report-icon">

                        <FaRecycle />

                    </div>

                    <h2>
                        Recycling Report
                    </h2>

                    <p>
                        AI-powered recycling and
                        reuse recommendations.
                    </p>


                    <div className="report-details">

                        <span>
                            Recommendations
                        </span>

                        <strong>
                            {
                                recyclingReport?.total_records
                                || 0
                            }
                        </strong>

                    </div>


                    <div className="report-details">

                        <span>
                            Recovery
                        </span>

                        <strong>
                            {
                                summary.total_recovered_quantity
                                || 0
                            } kg
                        </strong>

                    </div>

                </div>


                {/* ENVIRONMENTAL REPORT */}

                <div className="report-card">

                    <div className="report-icon">

                        <FaCloud />

                    </div>

                    <h2>
                        Environmental Impact
                    </h2>

                    <p>
                        Environmental benefits from
                        textile recovery activities.
                    </p>


                    <div className="report-details">

                        <span>
                            CO₂ Savings
                        </span>

                        <strong>
                            {
                                environmental.total_co2_savings
                                || 0
                            } kg
                        </strong>

                    </div>


                    <div className="report-details">

                        <span>
                            Water Savings
                        </span>

                        <strong>

                            {
                                (
                                    environmental.total_water_savings
                                    || 0
                                ).toLocaleString()
                            } L

                        </strong>

                    </div>

                </div>

            </div>


            {/* =================================================
                EXPORT
            ================================================= */}

            <div className="export-section">

                <div>

                    <h2>

                        <FaDownload />

                        Export Reports

                    </h2>

                    <p>
                        Download your waste records
                        for further analysis.
                    </p>

                </div>


                <button
                    className="export-button"
                    onClick={downloadCSV}
                >

                    <FaDownload />

                    Download CSV

                </button>

            </div>


            {/* =================================================
                QUICK NAVIGATION
            ================================================= */}

            <div className="reports-navigation">

                <Link to="/analytics">

                    <FaChartLine />

                    Executive Analytics

                </Link>


                <Link to="/sustainability">

                    <FaLeaf />

                    Sustainability Intelligence

                </Link>


                <Link to="/inventory">

                    <FaRecycle />

                    Waste Inventory

                </Link>

            </div>


            <div className="reports-footer">

                <p>

                    Textile Waste Intelligence Platform

                </p>

            </div>

        </div>

    );

}


export default Reports;