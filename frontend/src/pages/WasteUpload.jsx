import { useEffect, useState } from "react";

import API from "../services/api";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import {
    FaImage,
    FaBrain,
    FaCheckCircle,
    FaRecycle,
    FaRedo,
    FaLeaf,
    FaIndustry,
    FaChartBar,
    FaInfoCircle,
    FaCloudUploadAlt,
    FaMapMarkerAlt,
} from "react-icons/fa";

import "../css/WasteUpload.css";


// ============================================================
// WASTE UPLOAD COMPONENT
// ============================================================

function WasteUpload() {

    // ========================================================
    // SIDEBAR
    // ========================================================

    const [collapsed, setCollapsed] = useState(false);


    // ========================================================
    // IMAGE
    // ========================================================

    const [image, setImage] = useState(null);

    const [preview, setPreview] = useState(null);


    // ========================================================
    // FORM DATA
    // ========================================================

    const [formData, setFormData] = useState({

        source: "",

        waste_category: "",

        color: "",

        condition: "",

        weight: "",

        quantity: "",

        location: "",

        notes: "",

    });


    // ========================================================
    // RESULT
    // ========================================================

    const [message, setMessage] = useState("");

    const [prediction, setPrediction] = useState(null);

    const [loading, setLoading] = useState(false);


    // ========================================================
    // CLEAN PREVIEW URL
    // ========================================================

    useEffect(() => {

        return () => {

            if (preview) {

                URL.revokeObjectURL(preview);

            }

        };

    }, [preview]);


    // ========================================================
    // GET CURRENT USER
    // ========================================================

    const getCurrentUser = () => {

        try {

            const storedUser =
                localStorage.getItem("user");


            if (!storedUser) {

                return null;

            }


            const user =
                JSON.parse(storedUser);


            return user;

        }

        catch (error) {

            console.error(
                "Failed to read logged-in user:",
                error
            );

            return null;

        }

    };


    // ========================================================
    // GET CURRENT MANUFACTURER NAME
    // ========================================================

    const getCurrentManufacturer = () => {

        const user =
            getCurrentUser();


        const manufacturer =

            user?.full_name ||

            user?.name ||

            localStorage.getItem("full_name") ||

            localStorage.getItem("user_name") ||

            localStorage.getItem("name") ||

            "";


        return String(
            manufacturer
        ).trim();

    };


    // ========================================================
    // GET CURRENT MANUFACTURER ID
    // ========================================================

    const getCurrentManufacturerId = () => {

        const user =
            getCurrentUser();


        if (
            user?.id !== undefined &&
            user?.id !== null
        ) {

            return Number(user.id);

        }


        const storedId =
            localStorage.getItem("user_id");


        if (storedId) {

            const id =
                Number(storedId);


            if (!Number.isNaN(id)) {

                return id;

            }

        }


        return null;

    };


    // ========================================================
    // GET CURRENT ROLE
    // ========================================================

    const getCurrentRole = () => {

        const user =
            getCurrentUser();


        return String(

            user?.role ||

            localStorage.getItem("role") ||

            ""

        )
            .trim()
            .toLowerCase();

    };


    // ========================================================
    // IMAGE CHANGE
    // ========================================================

    const handleImageChange = (event) => {

        const file =
            event.target.files?.[0];


        if (!file) {

            return;

        }


        // ----------------------------------------------------
        // VALIDATE FILE TYPE
        // ----------------------------------------------------

        if (!file.type.startsWith("image/")) {

            setMessage(
                "Please select a valid textile image."
            );

            setImage(null);

            setPreview(null);

            setPrediction(null);

            return;

        }


        // ----------------------------------------------------
        // VALIDATE FILE SIZE
        // ----------------------------------------------------

        if (
            file.size >
            10 * 1024 * 1024
        ) {

            setMessage(
                "Image size must be less than 10 MB."
            );

            setImage(null);

            setPreview(null);

            setPrediction(null);

            return;

        }


        // ----------------------------------------------------
        // SET IMAGE
        // ----------------------------------------------------

        setImage(file);

        setPreview(
            URL.createObjectURL(file)
        );

        setMessage("");

        setPrediction(null);

    };


    // ========================================================
    // INPUT CHANGE
    // ========================================================

    const handleInputChange = (event) => {

        const {
            name,
            value,
        } = event.target;


        setFormData(
            (previous) => ({

                ...previous,

                [name]: value,

            })
        );

    };


    // ========================================================
    // RESET
    // ========================================================

    const handleReset = () => {

        setImage(null);

        setPreview(null);

        setPrediction(null);

        setMessage("");

        setLoading(false);


        setFormData({

            source: "",

            waste_category: "",

            color: "",

            condition: "",

            weight: "",

            quantity: "",

            location: "",

            notes: "",

        });


        const input =
            document.getElementById(
                "imageInput"
            );


        if (input) {

            input.value = "";

        }

    };


    // ========================================================
    // GET CONFIDENCE
    // ========================================================

    const getPredictionConfidence = (result) => {

        // ----------------------------------------------------
        // confidence_percentage
        // ----------------------------------------------------

        if (

            result?.confidence_percentage !==
            undefined &&

            result?.confidence_percentage !==
            null

        ) {

            const value =
                Number(
                    result.confidence_percentage
                );


            if (Number.isNaN(value)) {

                return null;

            }


            if (
                value >= 0 &&
                value <= 1
            ) {

                return value;

            }


            return value / 100;

        }


        // ----------------------------------------------------
        // confidence
        // ----------------------------------------------------

        if (

            result?.confidence !==
            undefined &&

            result?.confidence !==
            null

        ) {

            const value =
                Number(
                    result.confidence
                );


            if (Number.isNaN(value)) {

                return null;

            }


            return value > 1
                ? value / 100
                : value;

        }


        return null;

    };


    // ========================================================
    // SAVE WASTE TO DATABASE
    // ========================================================

    const saveWasteToDatabase = async (
        result
    ) => {

        // ====================================================
        // GET LOGGED-IN USER
        // ====================================================

        const currentUser =
            getCurrentUser();


        // ====================================================
        // GET MANUFACTURER
        // ====================================================

        const manufacturer =
            getCurrentManufacturer();


        // ====================================================
        // GET MANUFACTURER ID
        // ====================================================

        const manufacturerId =
            getCurrentManufacturerId();


        // ====================================================
        // GET ROLE
        // ====================================================

        const role =
            getCurrentRole();


        // ====================================================
        // LOCATION
        // ====================================================

        const location =
            String(
                formData.location || ""
            ).trim();


        // ====================================================
        // DEBUG
        // ====================================================

        console.log(
            "=========================================="
        );

        console.log(
            "CURRENT LOGGED-IN USER"
        );

        console.log(
            currentUser
        );

        console.log(
            "CURRENT MANUFACTURER:",
            manufacturer
        );

        console.log(
            "CURRENT MANUFACTURER ID:",
            manufacturerId
        );

        console.log(
            "CURRENT ROLE:",
            role
        );

        console.log(
            "CURRENT LOCATION:",
            location
        );

        console.log(
            "=========================================="
        );


        // ====================================================
        // VALIDATE USER
        // ====================================================

        if (!currentUser) {

            throw new Error(
                "Logged-in user information not found. Please login again."
            );

        }


        // ====================================================
        // VALIDATE MANUFACTURER
        // ====================================================

        if (!manufacturer) {

            throw new Error(
                "Manufacturer name not found. Please login again."
            );

        }


        // ====================================================
        // VALIDATE MANUFACTURER ID
        // ====================================================

        if (
            manufacturerId === null ||
            Number.isNaN(manufacturerId)
        ) {

            throw new Error(
                "Manufacturer ID not found. Please login again."
            );

        }


        // ====================================================
        // FABRIC TYPE
        // ====================================================

        const fabricType =

            result?.class_name ||

            result?.fabric_type ||

            result?.fabric ||

            result?.predicted_class ||

            "Unknown";


        // ====================================================
        // MATERIAL TYPE
        // ====================================================

        const materialType =

            result?.material_type ||

            result?.material ||

            fabricType;


        // ====================================================
        // CONFIDENCE
        // ====================================================

        const confidence =
            getPredictionConfidence(
                result
            );


        // ====================================================
        // CLASS INDEX
        // ====================================================

        const classIndex =

            result?.class_index ??

            result?.predicted_class_index ??

            null;


        // ====================================================
        // QUANTITY
        // ====================================================

        const enteredQuantity =
            Number(
                formData.quantity
            );


        const enteredWeight =
            Number(
                formData.weight
            );


        let quantity;

        let unit;


        // ----------------------------------------------------
        // QUANTITY HAS PRIORITY
        // ----------------------------------------------------

        if (

            formData.quantity &&

            !Number.isNaN(
                enteredQuantity
            ) &&

            enteredQuantity > 0

        ) {

            quantity =
                enteredQuantity;

            unit =
                "items";

        }


        // ----------------------------------------------------
        // OTHERWISE USE WEIGHT
        // ----------------------------------------------------

        else if (

            formData.weight &&

            !Number.isNaN(
                enteredWeight
            ) &&

            enteredWeight > 0

        ) {

            quantity =
                enteredWeight;

            unit =
                "kg";

        }


        // ----------------------------------------------------
        // DEFAULT
        // ----------------------------------------------------

        else {

            quantity = 1;

            unit = "items";

        }


        // ====================================================
        // WASTE DATA
        // ====================================================

        const wasteData = {

            // ------------------------------------------------
            // MANUFACTURER
            // ------------------------------------------------

            manufacturer_id:
                manufacturerId,

            manufacturer:
                manufacturer,


            // ------------------------------------------------
            // BASIC WASTE INFORMATION
            // ------------------------------------------------

            waste_type:
                String(fabricType),


            quantity:
                quantity,


            unit:
                unit,


            // ------------------------------------------------
            // LOCATION
            //
            // IMPORTANT:
            // DO NOT use source here.
            // ------------------------------------------------

            location:
                location || "Unknown",


            // ------------------------------------------------
            // STATUS
            // ------------------------------------------------

            status:
                "Available",


            // ------------------------------------------------
            // TEXTILE INFORMATION
            // ------------------------------------------------

            source:
                formData.source || null,


            waste_category:
                formData.waste_category || null,


            color:
                formData.color || null,


            condition:
                formData.condition || null,


            weight:
                formData.weight
                    ? Number(
                        formData.weight
                    )
                    : null,


            notes:
                formData.notes || null,


            // ------------------------------------------------
            // AI INFORMATION
            // ------------------------------------------------

            material_type:
                materialType || null,


            fabric_type:
                fabricType || null,


            class_index:
                classIndex,


            confidence:
                confidence,


            composition:

                result?.composition ||

                result?.fabric_composition ||

                null,


            recyclability:

                result?.recyclability ||

                result?.recyclable ||

                null,


            biodegradability:

                result?.biodegradability ||

                result?.biodegradable ||

                null,


            environmental_impact:

                result?.environmental_impact ||

                result?.eco_impact ||

                null,


            recommended_processing:

                result?.recommended_processing ||

                result?.recommendation ||

                result?.recommended_method ||

                result?.recommended_recycling ||

                null,


            recycling_method:

                result?.recycling_method ||

                result?.recycling_process ||

                result?.recycling_recommendation ||

                null,


            disposal_method:

                result?.disposal_method ||

                result?.disposal_recommendation ||

                null,


            potential_reuse:

                result?.potential_reuse ||

                result?.reuse ||

                result?.reuse_potential ||

                null,


            predicted_color:

                result?.predicted_color ||

                result?.color ||

                formData.color ||

                null,


            predicted_condition:

                result?.predicted_condition ||

                result?.condition ||

                formData.condition ||

                null,

        };


        // ====================================================
        // DEBUG DATA
        // ====================================================

        console.log(
            "=========================================="
        );

        console.log(
            "SAVING WASTE TO DATABASE"
        );

        console.log(
            "=========================================="
        );

        console.log(
            "MANUFACTURER ID:",
            manufacturerId
        );

        console.log(
            "MANUFACTURER:",
            manufacturer
        );

        console.log(
            "SOURCE:",
            formData.source
        );

        console.log(
            "CATEGORY:",
            formData.waste_category
        );

        console.log(
            "MATERIAL:",
            fabricType
        );

        console.log(
            "QUANTITY:",
            quantity
        );

        console.log(
            "UNIT:",
            unit
        );

        console.log(
            "LOCATION:",
            location || "Unknown"
        );

        console.log(
            "COMPLETE WASTE DATA:",
            wasteData
        );

        console.log(
            "=========================================="
        );


        // ====================================================
        // POST TO BACKEND
        // ====================================================

        const saveResponse =
            await API.post(
                "/waste/",
                wasteData
            );


        // ====================================================
        // SUCCESS LOG
        // ====================================================

        console.log(
            "=========================================="
        );

        console.log(
            "WASTE SAVED SUCCESSFULLY"
        );

        console.log(
            "SAVED WASTE:",
            saveResponse.data
        );

        console.log(
            "SAVED WASTE ID:",
            saveResponse.data?.id
        );

        console.log(
            "SAVED MANUFACTURER ID:",
            saveResponse.data?.manufacturer_id
        );

        console.log(
            "SAVED MANUFACTURER:",
            saveResponse.data?.manufacturer
        );

        console.log(
            "SAVED LOCATION:",
            saveResponse.data?.location
        );

        console.log(
            "=========================================="
        );


        return saveResponse.data;

    };


    // ========================================================
    // AI PREDICTION
    // ========================================================

    const handlePrediction = async () => {

        // ====================================================
        // IMAGE VALIDATION
        // ====================================================

        if (!image) {

            setMessage(
                "Please select a textile image first."
            );

            return;

        }


        // ====================================================
        // CURRENT USER
        // ====================================================

        const currentUser =
            getCurrentUser();


        // ====================================================
        // MANUFACTURER
        // ====================================================

        const manufacturer =
            getCurrentManufacturer();


        // ====================================================
        // MANUFACTURER ID
        // ====================================================

        const manufacturerId =
            getCurrentManufacturerId();


        // ====================================================
        // LOCATION
        // ====================================================

        const location =
            String(
                formData.location || ""
            ).trim();


        // ====================================================
        // DEBUG LOGIN INFORMATION
        // ====================================================

        console.log(
            "=========================================="
        );

        console.log(
            "LOGIN INFORMATION BEFORE PREDICTION"
        );

        console.log(
            "USER:",
            currentUser
        );

        console.log(
            "MANUFACTURER:",
            manufacturer
        );

        console.log(
            "MANUFACTURER ID:",
            manufacturerId
        );

        console.log(
            "LOCATION:",
            location
        );

        console.log(
            "=========================================="
        );


        // ====================================================
        // MANUFACTURER VALIDATION
        // ====================================================

        if (!currentUser) {

            setMessage(
                "Logged-in user information not found. Please login again."
            );

            return;

        }


        if (!manufacturer) {

            setMessage(
                "Manufacturer name not found. Please login again."
            );

            return;

        }


        if (
            manufacturerId === null ||
            Number.isNaN(manufacturerId)
        ) {

            setMessage(
                "Manufacturer ID not found. Please login again."
            );

            return;

        }


        // ====================================================
        // LOCATION VALIDATION
        // ====================================================

        if (!location) {

            setMessage(
                "Please enter the waste location."
            );

            return;

        }


        // ====================================================
        // SOURCE VALIDATION
        // ====================================================

        if (!formData.source) {

            setMessage(
                "Please select the waste source."
            );

            return;

        }


        // ====================================================
        // CATEGORY VALIDATION
        // ====================================================

        if (!formData.waste_category) {

            setMessage(
                "Please select the waste category."
            );

            return;

        }


        // ====================================================
        // CONDITION VALIDATION
        // ====================================================

        if (!formData.condition) {

            setMessage(
                "Please select the textile condition."
            );

            return;

        }


        // ====================================================
        // START LOADING
        // ====================================================

        setLoading(true);

        setMessage("");

        setPrediction(null);


        try {

            // ==================================================
            // CREATE FORM DATA
            // ==================================================

            const data =
                new FormData();


            // ==================================================
            // IMAGE
            // ==================================================

            data.append(
                "file",
                image
            );


            // ==================================================
            // SOURCE
            // ==================================================

            data.append(
                "source",
                formData.source
            );


            // ==================================================
            // CATEGORY
            // ==================================================

            data.append(
                "waste_category",
                formData.waste_category
            );


            // ==================================================
            // COLOR
            // ==================================================

            data.append(
                "color",
                formData.color || ""
            );


            // ==================================================
            // CONDITION
            // ==================================================

            data.append(
                "condition",
                formData.condition
            );


            // ==================================================
            // WEIGHT
            // ==================================================

            data.append(
                "weight",
                formData.weight || ""
            );


            // ==================================================
            // QUANTITY
            // ==================================================

            data.append(
                "quantity",
                formData.quantity || ""
            );


            // ==================================================
            // LOCATION
            // ==================================================

            data.append(
                "location",
                location
            );


            // ==================================================
            // NOTES
            // ==================================================

            data.append(
                "notes",
                formData.notes || ""
            );


            // ==================================================
            // MANUFACTURER ID
            // ==================================================

            data.append(
                "manufacturer_id",
                String(manufacturerId)
            );


            // ==================================================
            // MANUFACTURER
            // ==================================================

            data.append(
                "manufacturer",
                manufacturer
            );


            // ==================================================
            // DEBUG
            // ==================================================

            console.log(
                "=========================================="
            );

            console.log(
                "TEXTILE AI PREDICTION REQUEST"
            );

            console.log(
                "MANUFACTURER ID:",
                manufacturerId
            );

            console.log(
                "MANUFACTURER:",
                manufacturer
            );

            console.log(
                "SOURCE:",
                formData.source
            );

            console.log(
                "CATEGORY:",
                formData.waste_category
            );

            console.log(
                "CONDITION:",
                formData.condition
            );

            console.log(
                "LOCATION:",
                location
            );

            console.log(
                "=========================================="
            );


            // ==================================================
            // AI REQUEST
            // ==================================================

            const response =
                await API.post(
                    "/prediction/predict",
                    data
                );


            // ==================================================
            // LOG RESPONSE
            // ==================================================

            console.log(
                "TEXTILE AI PREDICTION RESPONSE:",
                response.data
            );


            // ==================================================
            // GET RESULT
            // ==================================================

            const result =

                response.data?.prediction ??

                response.data;


            // ==================================================
            // VALIDATE RESULT
            // ==================================================

            if (

                !result ||

                typeof result !==
                "object"

            ) {

                throw new Error(
                    "Backend returned no prediction data."
                );

            }


            // ==================================================
            // SAVE PREDICTION TO STATE
            // ==================================================

            const predictionWithInput = {

                ...result,

                input_data: {

                    manufacturer_id:
                        manufacturerId,

                    manufacturer:
                        manufacturer,

                    source:
                        formData.source,

                    waste_category:
                        formData.waste_category,

                    color:
                        formData.color,

                    condition:
                        formData.condition,

                    weight:
                        formData.weight,

                    quantity:
                        formData.quantity,

                    location:
                        location,

                    notes:
                        formData.notes,

                },

            };


            setPrediction(
                predictionWithInput
            );


            // ==================================================
            // SAVE TO DATABASE
            // ==================================================

            try {

                const savedWaste =
                    await saveWasteToDatabase(
                        result
                    );


                console.log(
                    "Saved Waste ID:",
                    savedWaste?.id
                );


                console.log(
                    "Saved Waste Location:",
                    savedWaste?.location
                );


                // ----------------------------------------------
                // SUCCESS
                // ----------------------------------------------

                setMessage(

                    `AI prediction completed and waste saved successfully. Waste ID: #${savedWaste?.id}`

                );

            }


            catch (saveError) {

                console.error(
                    "=========================================="
                );

                console.error(
                    "WASTE DATABASE SAVE ERROR"
                );

                console.error(
                    saveError
                );

                console.error(
                    "STATUS:",
                    saveError.response?.status
                );

                console.error(
                    "BACKEND RESPONSE:",
                    saveError.response?.data
                );

                console.error(
                    "=========================================="
                );


                setMessage(

                    saveError.response?.data?.detail ||

                    saveError.message ||

                    "AI prediction completed, but the waste could not be saved to the database."

                );

            }

        }


        catch (error) {

            // ==================================================
            // ERROR LOG
            // ==================================================

            console.error(
                "=========================================="
            );

            console.error(
                "TEXTILE AI PREDICTION ERROR"
            );

            console.error(
                "=========================================="
            );

            console.error(
                error
            );

            console.error(
                "Status:",
                error.response?.status
            );

            console.error(
                "Backend response:",
                error.response?.data
            );

            console.error(
                "=========================================="
            );


            setPrediction(null);


            // ==================================================
            // 404
            // ==================================================

            if (
                error.response?.status === 404
            ) {

                setMessage(
                    "Prediction API not found. Check the backend prediction route."
                );

            }


            // ==================================================
            // 422
            // ==================================================

            else if (
                error.response?.status === 422
            ) {

                const detail =
                    error.response?.data?.detail;


                if (
                    Array.isArray(detail)
                ) {

                    setMessage(

                        detail
                            .map(
                                (item) =>
                                    item?.msg ||
                                    "Invalid input"
                            )
                            .join(", ")

                    );

                }

                else {

                    setMessage(

                        detail ||

                        "Invalid input. Please check all fields."

                    );

                }

            }


            // ==================================================
            // 400
            // ==================================================

            else if (
                error.response?.status === 400
            ) {

                setMessage(

                    error.response?.data?.detail ||

                    "Invalid textile image or input."

                );

            }


            // ==================================================
            // 401
            // ==================================================

            else if (
                error.response?.status === 401
            ) {

                setMessage(
                    "Authentication required. Please login again."
                );

            }


            // ==================================================
            // 403
            // ==================================================

            else if (
                error.response?.status === 403
            ) {

                setMessage(
                    "You do not have permission to run textile prediction."
                );

            }


            // ==================================================
            // 500
            // ==================================================

            else if (
                error.response?.status === 500
            ) {

                setMessage(

                    error.response?.data?.detail ||

                    "AI prediction failed on the server."

                );

            }


            // ==================================================
            // NETWORK
            // ==================================================

            else if (
                error.code ===
                "ERR_NETWORK"
            ) {

                setMessage(
                    "Cannot connect to backend. Please make sure FastAPI server is running."
                );

            }


            // ==================================================
            // OTHER
            // ==================================================

            else {

                setMessage(

                    error.response?.data?.detail ||

                    error.message ||

                    "AI prediction failed. Please try again."

                );

            }

        }


        finally {

            setLoading(false);

        }

    };


    // ========================================================
    // FORMAT PERCENTAGE
    // ========================================================

    const formatPercentage = (
        value
    ) => {

        const number =
            Number(
                value ?? 0
            );


        if (
            Number.isNaN(number)
        ) {

            return "0.00";

        }


        return number.toFixed(2);

    };


    // ========================================================
    // PROBABILITY PERCENTAGE
    // ========================================================

    const getProbabilityPercentage = (
        item
    ) => {

        // ----------------------------------------------------
        // PERCENTAGE
        // ----------------------------------------------------

        if (

            item?.percentage !==
            undefined &&

            item?.percentage !==
            null

        ) {

            const percentage =
                Number(
                    item.percentage
                );


            if (
                Number.isNaN(
                    percentage
                )
            ) {

                return 0;

            }


            if (

                percentage >= 0 &&

                percentage <= 1

            ) {

                return (
                    percentage * 100
                );

            }


            return percentage;

        }


        // ----------------------------------------------------
        // PROBABILITY
        // ----------------------------------------------------

        if (

            item?.probability !==
            undefined &&

            item?.probability !==
            null

        ) {

            const probability =
                Number(
                    item.probability
                );


            if (
                Number.isNaN(
                    probability
                )
            ) {

                return 0;

            }


            if (

                probability >= 0 &&

                probability <= 1

            ) {

                return (
                    probability * 100
                );

            }


            return probability;

        }


        return 0;

    };


    // ========================================================
    // CONFIDENCE
    // ========================================================

    const getConfidence = () => {

        if (!prediction) {

            return 0;

        }


        // ----------------------------------------------------
        // CONFIDENCE PERCENTAGE
        // ----------------------------------------------------

        if (

            prediction.confidence_percentage !==
            undefined &&

            prediction.confidence_percentage !==
            null

        ) {

            const value =
                Number(
                    prediction.confidence_percentage
                );


            if (
                Number.isNaN(value)
            ) {

                return 0;

            }


            if (

                value >= 0 &&

                value <= 1

            ) {

                return (
                    value * 100
                );

            }


            return value;

        }


        // ----------------------------------------------------
        // CONFIDENCE
        // ----------------------------------------------------

        if (

            prediction.confidence !==
            undefined &&

            prediction.confidence !==
            null

        ) {

            const value =
                Number(
                    prediction.confidence
                );


            if (
                Number.isNaN(value)
            ) {

                return 0;

            }


            if (

                value >= 0 &&

                value <= 1

            ) {

                return (
                    value * 100
                );

            }


            return value;

        }


        return 0;

    };


    // ========================================================
    // PREDICTION VALUES
    // ========================================================

    const confidence =
        getConfidence();


    const material =

        prediction?.class_name ||

        prediction?.fabric_type ||

        prediction?.fabric ||

        prediction?.predicted_class ||

        "Unknown";


    const classIndex =

        prediction?.class_index ??

        prediction?.predicted_class_index;


    const materialType =

        prediction?.material_type ||

        prediction?.material ||

        "Not available";


    const composition =

        prediction?.composition ||

        prediction?.fabric_composition ||

        "Not available";


    const wasteCategory =

        prediction?.waste_category ||

        prediction?.category ||

        formData.waste_category ||

        "Not available";


    const recyclability =

        prediction?.recyclability ||

        prediction?.recyclable ||

        "Not available";


    const biodegradability =

        prediction?.biodegradability ||

        prediction?.biodegradable ||

        "Not available";


    const recommendedProcessing =

        prediction?.recommended_processing ||

        prediction?.recommendation ||

        prediction?.recommended_method ||

        prediction?.recommended_recycling ||

        "No processing recommendation available.";


    const potentialReuse =

        prediction?.potential_reuse ||

        prediction?.reuse ||

        prediction?.reuse_potential ||

        "No reuse information available.";


    const predictedColor =

        prediction?.predicted_color ||

        prediction?.color ||

        formData.color ||

        "Not available";


    const predictedCondition =

        prediction?.predicted_condition ||

        prediction?.condition ||

        formData.condition ||

        "Not available";


    const environmentalImpact =

        prediction?.environmental_impact ||

        prediction?.eco_impact ||

        "Not available";


    const recyclingMethod =

        prediction?.recycling_method ||

        prediction?.recycling_process ||

        prediction?.recycling_recommendation ||

        "Not available";


    const disposalMethod =

        prediction?.disposal_method ||

        prediction?.disposal_recommendation ||

        "Not available";


    // ========================================================
    // TOP PREDICTIONS
    // ========================================================

    const topPredictions =

        Array.isArray(
            prediction?.top_predictions
        )

            ? prediction.top_predictions

            : Array.isArray(
                prediction?.probabilities
            )

                ? prediction.probabilities.slice(
                    0,
                    5
                )

                : [];


    // ========================================================
    // ALL PROBABILITIES
    // ========================================================

    const allProbabilities =

        Array.isArray(
            prediction?.all_class_probabilities
        )

            ? prediction.all_class_probabilities

            : Array.isArray(
                prediction?.class_probabilities
            )

                ? prediction.class_probabilities

                : [];


    // ========================================================
    // CURRENT MANUFACTURER FOR UI
    // ========================================================

    const currentManufacturer =
        getCurrentManufacturer();


    const currentManufacturerId =
        getCurrentManufacturerId();


    // ========================================================
    // RENDER
    // ========================================================

    return (

        <div className="dashboard">


            {/* ==================================================
                SIDEBAR
            ================================================== */}

            <Sidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
            />


            {/* ==================================================
                CONTENT
            ================================================== */}

            <div
                className={
                    `dashboard-content ${
                        collapsed
                            ? "collapsed"
                            : ""
                    }`
                }
            >

                <Navbar />


                <div className="upload-container">


                    {/* ==================================================
                        PAGE TITLE
                    ================================================== */}

                    <h1>
                        Textile Waste Prediction
                    </h1>


                    <p>
                        Upload a textile image and provide
                        waste information to identify the
                        fabric type and receive AI-powered
                        textile recycling information.
                    </p>


                    {/* ==================================================
                        UPLOAD FORM
                    ================================================== */}

                    <div className="upload-form">


                        {/* ==================================================
                            IMAGE UPLOAD
                        ================================================== */}

                        <div className="image-upload">

                            <label
                                htmlFor="imageInput"
                            >

                                <FaCloudUploadAlt
                                    className="upload-icon"
                                />

                                <h3>
                                    Choose Textile Image
                                </h3>

                                <p>
                                    Click here to select textile image
                                </p>

                            </label>


                            <input
                                id="imageInput"
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={
                                    handleImageChange
                                }
                            />


                            {/* ==================================================
                                PREVIEW
                            ================================================== */}

                            {preview && (

                                <div className="preview-container">

                                    <img
                                        src={preview}
                                        alt="Textile Preview"
                                        className="preview-image"
                                    />


                                    <p>

                                        {image?.name}

                                        {" "}

                                        {image
                                            ? `${(
                                                image.size /
                                                1024
                                            ).toFixed(1)} KB`
                                            : ""
                                        }

                                    </p>

                                </div>

                            )}

                        </div>


                        {/* ==================================================
                            TEXTILE INFORMATION
                        ================================================== */}

                        <div className="textile-input-section">


                            <h2>
                                Textile Information
                            </h2>


                            <p>
                                Enter the available textile
                                information before running
                                the AI prediction.
                            </p>


                            {/* ==================================================
                                SOURCE
                            ================================================== */}

                            <div className="form-field">

                                <label>
                                    Waste Source *
                                </label>


                                <select
                                    name="source"
                                    value={
                                        formData.source
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                >

                                    <option value="">
                                        Select Source
                                    </option>

                                    <option value="Manufacturing">
                                        Manufacturing
                                    </option>

                                    <option value="Garment Production">
                                        Garment Production
                                    </option>

                                    <option value="Collection Center">
                                        Collection Center
                                    </option>

                                    <option value="Household">
                                        Household
                                    </option>

                                    <option value="Industrial">
                                        Industrial
                                    </option>

                                    <option value="Retail">
                                        Retail
                                    </option>

                                    <option value="Donation Center">
                                        Donation Center
                                    </option>

                                    <option value="Other">
                                        Other
                                    </option>

                                </select>

                            </div>


                            {/* ==================================================
                                CATEGORY
                            ================================================== */}

                            <div className="form-field">

                                <label>
                                    Waste Category *
                                </label>


                                <select
                                    name="waste_category"
                                    value={
                                        formData.waste_category
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                >

                                    <option value="">
                                        Select Category
                                    </option>

                                    <option value="Pre-consumer">
                                        Pre-consumer Waste
                                    </option>

                                    <option value="Post-consumer">
                                        Post-consumer Waste
                                    </option>

                                    <option value="Production Waste">
                                        Production Waste
                                    </option>

                                    <option value="Cutting Waste">
                                        Cutting Waste
                                    </option>

                                    <option value="Damaged Textile">
                                        Damaged Textile
                                    </option>

                                    <option value="Used Textile">
                                        Used Textile
                                    </option>

                                    <option value="Rejected Textile">
                                        Rejected Textile
                                    </option>

                                    <option value="Scrap Textile">
                                        Scrap Textile
                                    </option>

                                    <option value="Other">
                                        Other
                                    </option>

                                </select>

                            </div>


                            {/* ==================================================
                                COLOR
                            ================================================== */}

                            <div className="form-field">

                                <label>
                                    Color
                                </label>


                                <input
                                    type="text"
                                    name="color"
                                    value={
                                        formData.color
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    placeholder="Example: White, Blue, Black"
                                />

                            </div>


                            {/* ==================================================
                                CONDITION
                            ================================================== */}

                            <div className="form-field">

                                <label>
                                    Textile Condition *
                                </label>


                                <select
                                    name="condition"
                                    value={
                                        formData.condition
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                >

                                    <option value="">
                                        Select Condition
                                    </option>

                                    <option value="New">
                                        New
                                    </option>

                                    <option value="Good">
                                        Good
                                    </option>

                                    <option value="Used">
                                        Used
                                    </option>

                                    <option value="Damaged">
                                        Damaged
                                    </option>

                                    <option value="Heavily Damaged">
                                        Heavily Damaged
                                    </option>

                                    <option value="Unusable">
                                        Unusable
                                    </option>

                                </select>

                            </div>


                            {/* ==================================================
                                WEIGHT
                            ================================================== */}

                            <div className="form-field">

                                <label>
                                    Weight (kg)
                                </label>


                                <input
                                    type="number"
                                    name="weight"
                                    min="0"
                                    step="0.01"
                                    value={
                                        formData.weight
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    placeholder="Example: 5.5"
                                />

                            </div>


                            {/* ==================================================
                                QUANTITY
                            ================================================== */}

                            <div className="form-field">

                                <label>
                                    Quantity
                                </label>


                                <input
                                    type="number"
                                    name="quantity"
                                    min="1"
                                    value={
                                        formData.quantity
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    placeholder="Number of textile items"
                                />

                            </div>


                            {/* ==================================================
                                LOCATION
                            ================================================== */}

                            <div className="form-field">

                                <label>
                                    <FaMapMarkerAlt />
                                    {" "}
                                    Waste Location *
                                </label>


                                <input
                                    type="text"
                                    name="location"
                                    value={
                                        formData.location
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    placeholder="Example: Tirupati, Andhra Pradesh"
                                />

                            </div>


                            {/* ==================================================
                                NOTES
                            ================================================== */}

                            <div className="form-field">

                                <label>
                                    Additional Notes
                                </label>


                                <textarea
                                    name="notes"
                                    value={
                                        formData.notes
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    rows="4"
                                    placeholder="Enter any additional textile information..."
                                />

                            </div>

                        </div>


                        {/* ==================================================
                            BUTTONS
                        ================================================== */}

                        <div className="button-group">


                            {/* ==================================================
                                PREDICT
                            ================================================== */}

                            <button
                                type="button"
                                className="upload-btn"
                                onClick={
                                    handlePrediction
                                }
                                disabled={
                                    !image ||
                                    loading
                                }
                            >

                                {loading ? (

                                    <>

                                        <FaBrain />

                                        Predicting...

                                    </>

                                ) : (

                                    <>

                                        <FaBrain />

                                        Run AI Prediction

                                    </>

                                )}

                            </button>


                            {/* ==================================================
                                RESET
                            ================================================== */}

                            <button
                                type="button"
                                className="predict-btn"
                                onClick={
                                    handleReset
                                }
                                disabled={
                                    loading
                                }
                            >

                                <FaRedo />

                                Reset

                            </button>

                        </div>


                        {/* ==================================================
                            MESSAGE
                        ================================================== */}

                        {message && (

                            <p
                                className={
                                    prediction &&
                                    message.includes(
                                        "saved successfully"
                                    )
                                        ? "upload-message success"
                                        : "upload-message"
                                }
                            >

                                {message}

                            </p>

                        )}


                        {/* ==================================================
                            AI RESULT
                        ================================================== */}

                        {prediction && (

                            <div className="prediction-card">


                                {/* ==================================================
                                    RESULT TITLE
                                ================================================== */}

                                <h2>

                                    <FaCheckCircle />

                                    AI Prediction Result

                                </h2>


                                {/* ==================================================
                                    MANUFACTURER
                                ================================================== */}

                                <div className="prediction-item">

                                    <strong>
                                        Manufacturer
                                    </strong>

                                    <span>
                                        {
                                            currentManufacturer ||
                                            "Not available"
                                        }
                                    </span>

                                </div>


                                {/* ==================================================
                                    MANUFACTURER ID
                                ================================================== */}

                                {currentManufacturerId && (

                                    <div className="prediction-item">

                                        <strong>
                                            Manufacturer ID
                                        </strong>

                                        <span>
                                            {
                                                currentManufacturerId
                                            }
                                        </span>

                                    </div>

                                )}


                                {/* ==================================================
                                    LOCATION
                                ================================================== */}

                                <div className="prediction-item">

                                    <strong>
                                        <FaMapMarkerAlt />
                                        {" "}
                                        Location
                                    </strong>

                                    <span>
                                        {
                                            formData.location ||
                                            "Not available"
                                        }
                                    </span>

                                </div>


                                {/* ==================================================
                                    FABRIC TYPE
                                ================================================== */}

                                <div className="prediction-item">

                                    <strong>
                                        Fabric Type
                                    </strong>

                                    <span>
                                        {material}
                                    </span>

                                </div>


                                {/* ==================================================
                                    CLASS INDEX
                                ================================================== */}

                                {classIndex !== undefined &&
                                    classIndex !== null && (

                                        <div className="prediction-item">

                                            <strong>
                                                Class Index
                                            </strong>

                                            <span>
                                                {classIndex}
                                            </span>

                                        </div>

                                    )}


                                {/* ==================================================
                                    CONFIDENCE
                                ================================================== */}

                                <div className="prediction-item">

                                    <strong>
                                        AI Confidence
                                    </strong>

                                    <span>

                                        {formatPercentage(
                                            confidence
                                        )}

                                        %

                                    </span>

                                </div>


                                {/* ==================================================
                                    CONFIDENCE BAR
                                ================================================== */}

                                <div className="confidence-container">

                                    <div
                                        className="confidence-bar"
                                        style={{
                                            width:
                                                `${Math.min(
                                                    Math.max(
                                                        confidence,
                                                        0
                                                    ),
                                                    100
                                                )}%`,
                                        }}
                                    />

                                </div>


                                {/* ==================================================
                                    MATERIAL INFORMATION
                                ================================================== */}

                                <div className="prediction-recommendation">


                                    <div className="recommendation-title">

                                        <FaInfoCircle />

                                        Material Information

                                    </div>


                                    <p>

                                        <strong>
                                            Material Type:
                                        </strong>{" "}

                                        {materialType}

                                    </p>


                                    <p>

                                        <strong>
                                            Fabric Type:
                                        </strong>{" "}

                                        {material}

                                    </p>


                                    <p>

                                        <strong>
                                            Composition:
                                        </strong>{" "}

                                        {composition}

                                    </p>


                                    <p>

                                        <strong>
                                            Predicted Color:
                                        </strong>{" "}

                                        {predictedColor}

                                    </p>


                                    <p>

                                        <strong>
                                            Waste Category:
                                        </strong>{" "}

                                        {wasteCategory}

                                    </p>


                                    <p>

                                        <strong>
                                            Textile Condition:
                                        </strong>{" "}

                                        {predictedCondition}

                                    </p>

                                </div>


                                {/* ==================================================
                                    SUSTAINABILITY
                                ================================================== */}

                                <div className="prediction-recommendation">


                                    <div className="recommendation-title">

                                        <FaLeaf />

                                        Sustainability Information

                                    </div>


                                    <p>

                                        <strong>
                                            Recyclability:
                                        </strong>{" "}

                                        {recyclability}

                                    </p>


                                    <p>

                                        <strong>
                                            Biodegradability:
                                        </strong>{" "}

                                        {biodegradability}

                                    </p>


                                    <p>

                                        <strong>
                                            Environmental Impact:
                                        </strong>{" "}

                                        {environmentalImpact}

                                    </p>

                                </div>


                                {/* ==================================================
                                    PROCESSING
                                ================================================== */}

                                <div className="prediction-recommendation">


                                    <div className="recommendation-title">

                                        <FaRecycle />

                                        Recommended Processing

                                    </div>


                                    <p>

                                        <strong>
                                            Recommended Processing:
                                        </strong>{" "}

                                        {recommendedProcessing}

                                    </p>


                                    <p>

                                        <strong>
                                            Recycling Method:
                                        </strong>{" "}

                                        {recyclingMethod}

                                    </p>


                                    <p>

                                        <strong>
                                            Disposal Method:
                                        </strong>{" "}

                                        {disposalMethod}

                                    </p>

                                </div>


                                {/* ==================================================
                                    POTENTIAL REUSE
                                ================================================== */}

                                <div className="prediction-recommendation">


                                    <div className="recommendation-title">

                                        <FaIndustry />

                                        Potential Reuse

                                    </div>


                                    <p>
                                        {potentialReuse}
                                    </p>

                                </div>


                                {/* ==================================================
                                    SUBMITTED INFORMATION
                                ================================================== */}

                                <div className="prediction-recommendation">


                                    <div className="recommendation-title">

                                        <FaImage />

                                        Submitted Textile Information

                                    </div>


                                    <p>

                                        <strong>
                                            Manufacturer:
                                        </strong>{" "}

                                        {
                                            currentManufacturer ||
                                            "Not available"
                                        }

                                    </p>


                                    <p>

                                        <strong>
                                            Manufacturer ID:
                                        </strong>{" "}

                                        {
                                            currentManufacturerId ||
                                            "Not available"
                                        }

                                    </p>


                                    <p>

                                        <strong>
                                            Location:
                                        </strong>{" "}

                                        {
                                            formData.location ||
                                            "Not provided"
                                        }

                                    </p>


                                    <p>

                                        <strong>
                                            Source:
                                        </strong>{" "}

                                        {formData.source}

                                    </p>


                                    <p>

                                        <strong>
                                            Waste Category:
                                        </strong>{" "}

                                        {
                                            formData.waste_category
                                        }

                                    </p>


                                    <p>

                                        <strong>
                                            Color:
                                        </strong>{" "}

                                        {
                                            formData.color ||
                                            "Not provided"
                                        }

                                    </p>


                                    <p>

                                        <strong>
                                            Condition:
                                        </strong>{" "}

                                        {formData.condition}

                                    </p>


                                    <p>

                                        <strong>
                                            Weight:
                                        </strong>{" "}

                                        {formData.weight
                                            ? `${formData.weight} kg`
                                            : "Not provided"}

                                    </p>


                                    <p>

                                        <strong>
                                            Quantity:
                                        </strong>{" "}

                                        {
                                            formData.quantity ||
                                            "Not provided"
                                        }

                                    </p>


                                    <p>

                                        <strong>
                                            Notes:
                                        </strong>{" "}

                                        {
                                            formData.notes ||
                                            "No additional notes"
                                        }

                                    </p>

                                </div>


                                {/* ==================================================
                                    TOP 5 PREDICTIONS
                                ================================================== */}

                                {topPredictions.length > 0 && (

                                    <div className="probabilities">


                                        <h3>

                                            <FaChartBar />

                                            Top 5 AI Predictions

                                        </h3>


                                        {topPredictions
                                            .slice(
                                                0,
                                                5
                                            )
                                            .map(
                                                (
                                                    item,
                                                    index
                                                ) => {


                                                    const percentage =
                                                        getProbabilityPercentage(
                                                            item
                                                        );


                                                    const name =

                                                        item?.name ||

                                                        item?.class_name ||

                                                        item?.fabric_type ||

                                                        item?.class ||

                                                        `Class ${index + 1}`;


                                                    return (

                                                        <div
                                                            className="probability-row"
                                                            key={

                                                                item?.index ??

                                                                name ??

                                                                index

                                                            }
                                                        >

                                                            <span>

                                                                {index + 1}.

                                                                {" "}

                                                                {name}

                                                            </span>


                                                            <span>

                                                                {
                                                                    formatPercentage(
                                                                        percentage
                                                                    )
                                                                }

                                                                %

                                                            </span>

                                                        </div>

                                                    );

                                                }
                                            )}

                                    </div>

                                )}


                                {/* ==================================================
                                    ALL PROBABILITIES
                                ================================================== */}

                                {allProbabilities.length > 0 && (

                                    <div className="probabilities">


                                        <h3>

                                            <FaChartBar />

                                            All Class Probabilities

                                        </h3>


                                        {allProbabilities.map(

                                            (
                                                item,
                                                index
                                            ) => {


                                                const percentage =
                                                    getProbabilityPercentage(
                                                        item
                                                    );


                                                const name =

                                                    item?.name ||

                                                    item?.class_name ||

                                                    item?.fabric_type ||

                                                    item?.class ||

                                                    `Class ${index + 1}`;


                                                return (

                                                    <div
                                                        className="probability-row"
                                                        key={

                                                            item?.index ??

                                                            name ??

                                                            index

                                                        }
                                                    >

                                                        <span>
                                                            {name}
                                                        </span>


                                                        <span>

                                                            {
                                                                formatPercentage(
                                                                    percentage
                                                                )
                                                            }

                                                            %

                                                        </span>

                                                    </div>

                                                );

                                            }

                                        )}

                                    </div>

                                )}


                                {/* ==================================================
                                    AI SUMMARY
                                ================================================== */}

                                <div className="prediction-recommendation">


                                    <div className="recommendation-title">

                                        <FaBrain />

                                        AI Classification Summary

                                    </div>


                                    <p>

                                        The AI model classified the
                                        uploaded textile image as{" "}

                                        <strong>
                                            {material}
                                        </strong>

                                        {" "}with a confidence of{" "}

                                        <strong>

                                            {
                                                formatPercentage(
                                                    confidence
                                                )
                                            }

                                            %

                                        </strong>.

                                    </p>


                                    <p>

                                        The classification result should
                                        be considered together with the
                                        textile's physical condition,
                                        source, waste category, location
                                        and other available information
                                        before making recycling or
                                        processing decisions.

                                    </p>

                                </div>

                            </div>

                        )}

                    </div>

                </div>

            </div>

        </div>

    );

}


// ============================================================
// EXPORT
// ============================================================

export default WasteUpload;