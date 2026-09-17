import "./Sustainability.css";

import {
    useEffect,
    useState
} from "react";

import {
    Link
} from "react-router-dom";

import {
    FaArrowLeft,
    FaLeaf,
    FaRecycle,
    FaTint,
    FaTrash,
    FaChartPie,
    FaLightbulb,
    FaWater
} from "react-icons/fa";

import Api from "../services/Api";


function Sustainability() {

    const [summary, setSummary] = useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // =====================================================
    // LOAD SUSTAINABILITY DATA
    // =====================================================

    useEffect(() => {

        loadSustainability();

    }, []);


    const loadSustainability = async () => {

        try {

            setLoading(true);

            setError("");

            const response =
                await Api.get(
                    "/sustainability/summary"
                );

            setSummary(response.data);

        }

        catch (err) {

            console.error(
                "Sustainability error:",
                err
            );

            setError(
                err?.response?.data?.detail ||
                "Unable to load sustainability analytics."
            );

        }

        finally {

            setLoading(false);

        }

    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="sustainability-page">

                <div className="sustainability-loading">

                    <FaLeaf />

                    <h2>
                        Loading Sustainability Intelligence...
                    </h2>

                </div>

            </div>

        );

    }


    // =====================================================
    // ERROR
    // =====================================================

    if (error) {

        return (

            <div className="sustainability-page">

                <div className="sustainability-error">

                    <h2>
                        Sustainability Analytics
                    </h2>

                    <p>
                        {error}
                    </p>

                    <Link
                        to="/dashboard"
                        className="back-button"
                    >
                        <FaArrowLeft />
                        Back to Dashboard
                    </Link>

                </div>

            </div>

        );

    }


    const categories =
        summary?.circularity_categories || {};

    const materials =
        summary?.material_distribution || {};

    const records =
        summary?.records || [];


    return (

        <div className="sustainability-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <header className="sustainability-header">

                <div>

                    <h1>
                        <FaLeaf />
                        Sustainability Intelligence
                    </h1>

                    <p>
                        Circular economy analytics,
                        environmental impact and
                        recycling recommendations
                    </p>

                </div>


                <Link
                    to="/dashboard"
                    className="back-button"
                >

                    <FaArrowLeft />

                    Dashboard

                </Link>

            </header>


            {/* =================================================
                KPI CARDS
            ================================================= */}

            <section className="sustainability-stats">


                <div className="sustainability-card">

                    <FaChartPie />

                    <span>
                        Circularity Score
                    </span>

                    <strong>
                        {summary?.average_circularity_score || 0}%
                    </strong>

                </div>


                <div className="sustainability-card">

                    <FaRecycle />

                    <span>
                        Waste Diversion
                    </span>

                    <strong>
                        {summary?.waste_diversion_rate || 0}%
                    </strong>

                </div>


                <div className="sustainability-card">

                    <FaLeaf />

                    <span>
                        CO₂ Savings
                    </span>

                    <strong>
                        {summary?.total_co2_savings || 0} kg
                    </strong>

                </div>


                <div className="sustainability-card">

                    <FaWater />

                    <span>
                        Water Savings
                    </span>

                    <strong>
                        {summary?.total_water_savings || 0} L
                    </strong>

                </div>


                <div className="sustainability-card">

                    <FaTrash />

                    <span>
                        Landfill Reduction
                    </span>

                    <strong>
                        {summary?.total_landfill_reduction || 0} kg
                    </strong>

                </div>


                <div className="sustainability-card">

                    <FaRecycle />

                    <span>
                        Recovered Material
                    </span>

                    <strong>
                        {summary?.total_recovered_quantity || 0} kg
                    </strong>

                </div>


            </section>


            {/* =================================================
                ANALYTICS
            ================================================= */}

            <section className="analytics-grid">


                {/* CIRCULARITY */}

                <div className="analytics-card">

                    <h2>
                        Circularity Categories
                    </h2>

                    {Object.keys(categories).length === 0 ? (

                        <p>
                            No sustainability records available.
                        </p>

                    ) : (

                        Object.entries(categories).map(
                            ([category, count]) => (

                                <div
                                    className="analytics-row"
                                    key={category}
                                >

                                    <span>
                                        {category}
                                    </span>

                                    <strong>
                                        {count}
                                    </strong>

                                </div>

                            )
                        )

                    )}

                </div>


                {/* MATERIAL DISTRIBUTION */}

                <div className="analytics-card">

                    <h2>
                        Material Distribution
                    </h2>

                    {Object.keys(materials).length === 0 ? (

                        <p>
                            No material data available.
                        </p>

                    ) : (

                        Object.entries(materials).map(
                            ([material, count]) => (

                                <div
                                    className="analytics-row"
                                    key={material}
                                >

                                    <span>
                                        {material}
                                    </span>

                                    <strong>
                                        {count}
                                    </strong>

                                </div>

                            )
                        )

                    )}

                </div>


                {/* SCORING MODEL */}

                <div className="analytics-card">

                    <h2>
                        Weighted Circularity Model
                    </h2>

                    <div className="score-row">

                        <span>
                            Material Recyclability
                        </span>

                        <strong>
                            35%
                        </strong>

                    </div>

                    <div className="score-row">

                        <span>
                            Material Condition
                        </span>

                        <strong>
                            20%
                        </strong>

                    </div>

                    <div className="score-row">

                        <span>
                            Reuse Potential
                        </span>

                        <strong>
                            20%
                        </strong>

                    </div>

                    <div className="score-row">

                        <span>
                            Environmental Benefit
                        </span>

                        <strong>
                            15%
                        </strong>

                    </div>

                    <div className="score-row">

                        <span>
                            Processing Feasibility
                        </span>

                        <strong>
                            10%
                        </strong>

                    </div>

                </div>


            </section>


            {/* =================================================
                RECOMMENDATIONS
            ================================================= */}

            <section className="recommendations-section">

                <div className="section-heading">

                    <div>

                        <h2>
                            <FaLightbulb />
                            Recycling & Reuse Recommendations
                        </h2>

                        <p>
                            AI-driven recovery recommendations
                            for each textile waste batch.
                        </p>

                    </div>

                </div>


                {records.length === 0 ? (

                    <div className="empty-state">

                        <FaRecycle />

                        <h3>
                            No Waste Records
                        </h3>

                        <p>
                            Add textile waste from the
                            Inventory page to generate
                            sustainability recommendations.
                        </p>

                    </div>

                ) : (

                    <div className="recommendation-grid">

                        {records.map((item) => (

                            <div
                                className="recommendation-card"
                                key={item.waste_id}
                            >

                                <div className="recommendation-header">

                                    <div>

                                        <span>
                                            Batch ID
                                        </span>

                                        <h3>
                                            {item.batch_id}
                                        </h3>

                                    </div>

                                    <div className="circularity-score">

                                        {item.circularity_score}%

                                    </div>

                                </div>


                                <div className="recommendation-info">

                                    <div>
                                        <span>
                                            Fabric : 
                                        </span>

                                        <strong>
                                            {item.fabric_type}
                                        </strong>
                                    </div>


                                    <div>
                                        <span>
                                            Quantity :
                                        </span>

                                        <strong>
                                            {item.quantity} kg
                                        </strong>
                                    </div>


                                    <div>
                                        <span>
                                            Condition  :
                                        </span>

                                        <strong>
                                            {item.condition || "Unknown"}
                                        </strong>
                                    </div>


                                    <div>
                                        <span>
                                            Recovery Potential :
                                        </span>

                                        <strong>
                                            {item.circularity_category}
                                        </strong>
                                    </div>

                                </div>


                                <div className="recommendation-main">

                                    <span>
                                        Recommended Strategy -
                                    </span>

                                    <strong>
                                        {item.recommended_strategy}
                                    </strong>

                                    <p>
                                        {item.recommendation_reason}
                                    </p>

                                </div>


                                <div className="impact-grid">

                                    <div>

                                        <span>
                                            CO₂ Savings
                                        </span>

                                        <strong>
                                            {item.co2_savings} kg
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Water Savings
                                        </span>

                                        <strong>
                                            {item.water_savings} L
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Recovery
                                        </span>

                                        <strong>
                                            {item.recovery_rate}%
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Recovered
                                        </span>

                                        <strong>
                                            {item.recovered_quantity} kg
                                        </strong>

                                    </div>

                                </div>


                                <div className="secondary-strategy">

                                    Alternative:
                                    {" "}
                                    <strong>
                                        {item.secondary_strategy}
                                    </strong>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </section>


            {/* =================================================
                FOOTER
            ================================================= */}

            <footer className="sustainability-footer">

                Textile Waste Intelligence Platform
                {" • "}
                Sustainability Intelligence Engine

            </footer>

        </div>

    );

}


export default Sustainability;