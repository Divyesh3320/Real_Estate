import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from 'react-router-dom';

function PostProperty() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isEditMode, setIsEditMode] = useState(false);
    const [propertyId, setPropertyId] = useState(null);
    const [propertyType, setPropertyType] = useState("");
    const [subType, setSubType] = useState("");
    const [city, setCity] = useState("");
    const [purpose, setPurpose] = useState("");
    const [dynamicFields, setDynamicFields] = useState("");
    const [description, setDescription] = useState("");
    const [ownerContactNo, setOwnerContactNo] = useState("");
    const [ownerContactEmail, setOwnerContactEmail] = useState("");
    const [price, setPrice] = useState("");
    const [formData, setFormData] = useState({
        propertyTypeId: "",
        subTypeId: "",
        cityId: "",
        purpose: "",
        price: "",
        description: "",
        ownerContactNo: "",
        ownerContactEmail: "",
        imageUrls: "",
        address: "",
        userId: JSON.parse(localStorage.getItem('user'))?.userId || 0,

        // Dynamic specification fields with null as default
        bhk: null,
        bathrooms: null,
        balconies: null,
        furnishingStatus: null,
        parking: null,
        carpetArea: null,
        plotArea: null,
        zoningType: null,
        roadAccess: null,
        totalBeds: null,
        services: null
    });

    const [errors, setErrors] = useState({
        propertyTypeId: '',
        subTypeId: '',
        cityId: '',
        purpose: '',
        price: '',
        description: '',
        ownerContactNo: '',
        ownerContactEmail: '',
        address: '',
        imageUrls: ''
    });

    const subTypes = {
        "1": ["Apartment/Flat", "Independent House/Villa"],
        "2": ["Office Space", "Retail/Shop Space", "Warehouse/Godown"],
        "3": ["Residential Land", "Agricultural Land", "Commercial Land", "Industrial Plot"],
        "4": ["Hostels", "PG", "Hotels/Resorts", "Apartment/Flat", "Independent House/Villa"]
    };

    const cities = [
        "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar", "Bhavnagar", "Jamnagar",
        "Junagadh", "Anand", "Nadiad", "Mehsana", "Morbi", "Surendranagar", "Valsad",
        "Bharuch", "Navsari", "Dahod", "Patan", "Palanpur", "Porbandar"
    ];

    // Define dynamic fields with their input types and labels
    const dynamicFieldsData = {
        "1": [ // Residential
            { name: "bhk", label: "BHK", type: "number" },
            { name: "bathrooms", label: "Bathrooms", type: "number" },
            { name: "balconies", label: "Balconies", type: "number" },
            { name: "furnishingStatus", label: "Furnishing Status", type: "select", 
              options: ["Unfurnished", "Semi-Furnished", "Fully Furnished"] },
            { name: "parking", label: "Parking Available", type: "select", 
              options: ["Yes", "No"] }
        ],
        "2": [ // Commercial
            { name: "carpetArea", label: "Carpet Area (sq ft)", type: "number" },
            { name: "furnishingStatus", label: "Furnishing Status", type: "select", 
              options: ["Unfurnished", "Semi-Furnished", "Fully Furnished"] },
            { name: "parking", label: "Parking Available", type: "select", 
              options: ["Yes", "No"] }
        ],
        "3": [ // Land
            { name: "plotArea", label: "Plot Area (sq ft)", type: "number" },
            { name: "zoningType", label: "Zoning Type", type: "select", 
              options: ["Residential", "Commercial", "Industrial", "Agricultural"] },
            { name: "roadAccess", label: "Road Access", type: "select", 
              options: ["Yes", "No"] }
        ],
        "4": [ // Rental
            { name: "totalBeds", label: "Total Beds", type: "number" },
            { name: "services", label: "Services", type: "text" }
        ]
    };

    // Property type mapping
    const propertyTypes = {
        1: "Residential",
        2: "Commercial",
        3: "Land",
        4: "Rental"
    };

    // Property sub-type mapping with IDs
    const subTypesWithIds = {
        1: [
            { id: 1, name: "Apartment/Flat" },
            { id: 2, name: "Independent House/Villa" }
        ],
        2: [
            { id: 3, name: "Office Space" },
            { id: 4, name: "Retail/Shop Space" },
            { id: 5, name: "Warehouse/Godown" }
        ],
        3: [
            { id: 6, name: "Residential Land" },
            { id: 7, name: "Agricultural Land" },
            { id: 8, name: "Commercial Land" },
            { id: 9, name: "Industrial Plot" }
        ],
        4: [
            { id: 10, name: "Hostels" },
            { id: 11, name: "PG" },
            { id: 12, name: "Hotels/Resorts" },
            { id: 13, name: "Apartment/Flat" },
            { id: 14, name: "Independent House/Villa" }
        ]
    };

    // Cities mapping with IDs
    const citiesWithIds = [
        { id: 1, name: "Ahmedabad" },
        { id: 2, name: "Surat" },
        { id: 3, name: "Vadodara" },
        { id: 4, name: "Rajkot" },
        { id: 5, name: "Gandhinagar" },
        { id: 6, name: "Bhavnagar" },
        { id: 7, name: "Jamnagar" },
        { id: 8, name: "Junagadh" },
        { id: 9, name: "Anand" },
        { id: 10, name: "Nadiad" },
        { id: 11, name: "Mehsana" },
        { id: 12, name: "Morbi" },
        { id: 13, name: "Surendranagar" },
        { id: 14, name: "Valsad" },
        { id: 15, name: "Bharuch" },
        { id: 16, name: "Navsari" },
        { id: 17, name: "Dahod" },
        { id: 18, name: "Patan" },
        { id: 19, name: "Palanpur" },
        { id: 20, name: "Porbandar" }
    ];

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const editPropertyId = params.get('edit');
        
        if (editPropertyId) {
            setIsEditMode(true);
            setPropertyId(editPropertyId);
            fetchPropertyDetails(editPropertyId);
        }
    }, [location]);

    const fetchPropertyDetails = async (id) => {
        try {
            const response = await fetch(
                `https://localhost:7019/api/PropertiesApi/GetPropertyById/${id}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const propertyData = await response.json();
            
            // Set all the form fields with the fetched data
            setPropertyType(propertyData.propertyTypeId.toString());
            setSubType(propertyData.subTypeId.toString());
            setPurpose(propertyData.purpose);
            setCity(propertyData.cityId.toString());
            
            setFormData({
                propertyTypeId: propertyData.propertyTypeId.toString(),
                subTypeId: propertyData.subTypeId.toString(),
                cityId: propertyData.cityId.toString(),
                purpose: propertyData.purpose,
                price: propertyData.price.toString(),
                description: propertyData.description,
                ownerContactNo: propertyData.ownerContactNo,
                ownerContactEmail: propertyData.ownerContactEmail,
                imageUrls: propertyData.imageUrlList?.join(',') || '',
                address: propertyData.address,
                userId: JSON.parse(localStorage.getItem('user'))?.userId || 0,

                // Handle type-specific details
                ...(propertyData.residentialDetails && {
                    bhk: propertyData.residentialDetails.bhk,
                    bathrooms: propertyData.residentialDetails.bathrooms,
                    balconies: propertyData.residentialDetails.balconies,
                    furnishingStatus: propertyData.residentialDetails.furnishingStatus,
                    parking: propertyData.residentialDetails.parkingAvailable ? "Yes" : "No"
                }),
                ...(propertyData.commercialDetails && {
                    carpetArea: propertyData.commercialDetails.carpetArea,
                    furnishingStatus: propertyData.commercialDetails.furnishingStatus,
                    parking: propertyData.commercialDetails.parking ? "Yes" : "No"
                }),
                ...(propertyData.landDetails && {
                    plotArea: propertyData.landDetails.plotArea,
                    zoningType: propertyData.landDetails.zoningType,
                    roadAccess: propertyData.landDetails.roadAccess ? "Yes" : "No"
                }),
                ...(propertyData.rentalDetails && {
                    totalBeds: propertyData.rentalDetails.totalBeds,
                    services: propertyData.rentalDetails.services
                })
            });

        } catch (error) {
            console.error("Error fetching property details:", error);
            alert('Failed to fetch property details');
        }
    };

    const renderDynamicFields = (propertyTypeId) => {
        const fields = dynamicFieldsData[propertyTypeId] || [];
        
        return fields.map((field, index) => (
            <div className="col-md-6 mb-3" key={index}>
                <label className="form-label fw-semibold">{field.label}</label>
                {field.type === "select" ? (
                    <select 
                        className="form-select shadow-sm"
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={handleInputChange}
                    >
                        <option value="">Select {field.label}</option>
                        {field.options.map((option, i) => (
                            <option key={i} value={option}>{option}</option>
                        ))}
                    </select>
                ) : field.type === "multiselect" ? (
                    <select 
                        className="form-select shadow-sm"
                        name={field.name}
                        value={formData[field.name] || []}
                        onChange={handleInputChange}
                        multiple
                    >
                        {field.options.map((option, i) => (
                            <option key={i} value={option}>{option}</option>
                        ))}
                    </select>
                ) : (
                    <input 
                        type={field.type}
                        className="form-control shadow-sm"
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={handleInputChange}
                        placeholder={`Enter ${field.label}`}
                    />
                )}
            </div>
        ));
    };

    const handlePropertyTypeChange = (e) => {
        const typeId = e.target.value;
        
        setPropertyType(typeId);
        setSubType("");
        setFormData(prev => ({
            ...prev,
            propertyTypeId: typeId,
            subTypeId: ""
        }));
    };

    const handleSubTypeChange = (e) => {
        const subTypeId = e.target.value;
        setSubType(subTypeId);
        setDynamicFields(dynamicFieldsData[propertyType] || "");
        setFormData(prev => ({
            ...prev,
            subTypeId: subTypeId
        }));
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
    
        // Validate file count
        if (files.length > 10) {
            alert("You can only upload up to 10 images");
            return;
        }
    
        // Validate file types and sizes
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        const maxSize = 5 * 1024 * 1024; // 5MB
    
        const invalidFiles = files.filter(file => {
            if (!validTypes.includes(file.type)) {
                alert(`File ${file.name} is not a valid image type`);
                return true;
            }
            if (file.size > maxSize) {
                alert(`File ${file.name} is too large. Maximum size is 5MB`);
                return true;
            }
            return false;
        });
    
        if (invalidFiles.length > 0) {
            return;
        }
    
        try {
            const uploadPromises = files.map(async (file) => {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', 'ml_default2'); // Ensure this matches your preset name
    
                console.log('Uploading file:', file.name); // Log the file being uploaded
    
                const response = await fetch(
                    'https://api.cloudinary.com/v1_1/dfojntght/image/upload', // Use the correct cloud name
                    {
                        method: 'POST',
                        body: formData
                    }
                );
    
                console.log('Response status:', response.status); // Log the response status
    
                if (!response.ok) {
                    const errorText = await response.text(); // Read the error message
                    throw new Error(`Upload failed: ${errorText}`);
                }
    
                const data = await response.json(); // Parse the response as JSON
                console.log('Uploaded file data:', data); // Log the parsed JSON data
    
                return data.secure_url; // Return the secure URL of the uploaded image
            });
    
            const uploadedUrls = await Promise.all(uploadPromises);
    
            setFormData(prev => ({
                ...prev,
                imageUrls: uploadedUrls.join(',')
            }));
    
            // Show success message
            alert('Images uploaded successfully!');
    
        } catch (error) {
            console.error('Error uploading images:', error);
            alert('Failed to upload images. Please try again.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
       
        setFormData(prev => ({
            ...prev,
            [name]: value === "" ? null : value
        }));
    };

    const validateForm = () => {
        let tempErrors = {};
        let isValid = true;

        // Basic Details validation
        if (!formData.propertyTypeId) {
            tempErrors.propertyTypeId = 'Property Type is required';
            isValid = false;
        }

        if (!formData.subTypeId) {
            tempErrors.subTypeId = 'Sub Type is required';
            isValid = false;
        }

        if (!formData.purpose) {
            tempErrors.purpose = 'Purpose is required';
            isValid = false;
        }

        if (!formData.price) {
            tempErrors.price = 'Price is required';
            isValid = false;
        } else if (formData.price <= 0) {
            tempErrors.price = 'Price must be greater than 0';
            isValid = false;
        }

        // Location validation
        if (!formData.cityId) {
            tempErrors.cityId = 'City is required';
            isValid = false;
        }

        if (!formData.address || formData.address.trim() === '') {
            tempErrors.address = 'Address is required';
            isValid = false;
        }

        // Description validation
        if (!formData.description || formData.description.trim() === '') {
            tempErrors.description = 'Description is required';
            isValid = false;
        }

        // Contact validation
        if (!formData.ownerContactNo) {
            tempErrors.ownerContactNo = 'Contact Number is required';
            isValid = false;
        } else if (!/^\d{10}$/.test(formData.ownerContactNo)) {
            tempErrors.ownerContactNo = 'Contact Number must be 10 digits';
            isValid = false;
        }

        if (!formData.ownerContactEmail) {
            tempErrors.ownerContactEmail = 'Email is required';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.ownerContactEmail)) {
            tempErrors.ownerContactEmail = 'Email is invalid';
            isValid = false;
        }

        // Image validation
        if (!formData.imageUrls) {
            tempErrors.imageUrls = 'At least one image is required';
            isValid = false;
        }

        setErrors(tempErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form before submission
        if (!validateForm()) {
            return;
        }

        // Get the property type and subtype names
        const propertyTypeName = propertyTypes[formData.propertyTypeId];
        const subTypeName = subTypesWithIds[formData.propertyTypeId]?.find(
            st => st.id === parseInt(formData.subTypeId)
        )?.name;
        const cityName = citiesWithIds.find(
            city => city.id === parseInt(formData.cityId)
        )?.name;

        // Create details objects based on property type
        const residentialDetails = formData.propertyTypeId === "1" ? {
            bhk: formData.bhk,
            bathrooms: formData.bathrooms,
            balconies: formData.balconies,
            furnishingStatus: formData.furnishingStatus,
            parkingAvailable: formData.parking === "Yes"
        } : null;

        const commercialDetails = formData.propertyTypeId === "2" ? {
            carpetArea: formData.carpetArea,
            furnishingStatus: formData.furnishingStatus,
            parking: formData.parking
        } : null;

        const landDetails = formData.propertyTypeId === "3" ? {
            plotArea: formData.plotArea,
            zoningType: formData.zoningType,
            roadAccess: formData.roadAccess === "Yes"
        } : null;

        const rentalDetails = formData.propertyTypeId === "4" ? {
            totalBeds: formData.totalBeds,
            services: formData.services
        } : null;

        const processedFormData = {
            ...formData,
            propertyId: isEditMode ? parseInt(propertyId) : undefined, // Include propertyId only in edit mode
            propertyTypeId: parseInt(formData.propertyTypeId),
            subTypeId: parseInt(formData.subTypeId),
            cityId: parseInt(formData.cityId),
            price: parseFloat(formData.price),
            address: formData.address || "Default Address",
            cityName: cityName,
            propertyTypeName: propertyTypeName,
            subTypeName: subTypeName,
            residentialDetails: residentialDetails,
            rentalDetails: rentalDetails,
            commercialDetails: commercialDetails,
            landDetails: landDetails
        };

        try {
            const url = isEditMode 
                ? 'https://localhost:7019/api/PropertiesApi/UpdateProperty'
                : 'https://localhost:7019/api/PropertiesApi/AddProperty';

            const response = await fetch(url, {
                method: isEditMode ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(processedFormData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            alert(isEditMode ? 'Property updated successfully!' : 'Property added successfully!');
            navigate('/user-profile');  // This path is correct as is

        } catch (error) {
            console.error('Error:', error);
            alert(`Failed to ${isEditMode ? 'update' : 'add'} property: ${error.message}`);
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-12 col-lg-8">
                    <div className="card border-0 shadow-lg">
                        <div className="card-body p-4 p-md-5">
                            <h2 className="text-center mb-4 text-primary fw-bold">
                                {isEditMode ? 'Edit Property' : 'Add Property'}
                            </h2>
                            <form id="propertyForm" onSubmit={handleSubmit}>
                                {/* Basic Property Information */}
                                <div className="bg-light p-4 rounded-3 mb-4">
                                    <h5 className="mb-4 text-secondary fw-bold">
                                        <i className="bi bi-house-door me-2"></i>Basic Details
                                    </h5>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Property Type</label>
                                            <select 
                                                className={`form-select shadow-sm ${errors.propertyTypeId ? 'is-invalid' : ''}`}
                                                value={formData.propertyTypeId}
                                                onChange={handlePropertyTypeChange}
                                            >
                                                <option value="">Select Property Type</option>
                                                {Object.entries(propertyTypes).map(([id, name]) => (
                                                    <option key={id} value={id}>{name}</option>
                                                ))}
                                            </select>
                                            {errors.propertyTypeId && 
                                                <div className="invalid-feedback">{errors.propertyTypeId}</div>
                                            }
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Property Sub-Type</label>
                                            <select 
                                                className={`form-select shadow-sm ${errors.subTypeId ? 'is-invalid' : ''}`}
                                                value={formData.subTypeId}
                                                onChange={handleSubTypeChange}
                                            >
                                                <option value="">Select Sub-Type</option>
                                                {subTypesWithIds[formData.propertyTypeId]?.map(subType => (
                                                    <option key={subType.id} value={subType.id}>
                                                        {subType.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.subTypeId && 
                                                <div className="invalid-feedback">{errors.subTypeId}</div>
                                            }
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Purpose</label>
                                            <select 
                                                className={`form-select shadow-sm ${errors.purpose ? 'is-invalid' : ''}`}
                                                name="purpose"
                                                value={purpose} 
                                                onChange={(e) => {
                                                    setPurpose(e.target.value);
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        purpose: e.target.value
                                                    }));
                                                }}
                                            >
                                                <option value="">Select Purpose</option>
                                                <option value="Sale">Sale</option>
                                                <option value="Rent">Rent</option>
                                            </select>
                                            {errors.purpose && 
                                                <div className="invalid-feedback">{errors.purpose}</div>
                                            }
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Price</label>
                                            <input 
                                                type="number" 
                                                className={`form-control shadow-sm ${errors.price ? 'is-invalid' : ''}`}
                                                name="price"
                                                value={formData.price}
                                                onChange={handleInputChange}
                                                placeholder="Enter property price"
                                            />
                                            {errors.price && 
                                                <div className="invalid-feedback">{errors.price}</div>
                                            }
                                        </div>
                                    </div>
                                </div>

                                {/* Location Information */}
                                <div className="bg-light p-4 rounded-3 mb-4">
                                    <h5 className="mb-4 text-secondary fw-bold">
                                        <i className="bi bi-geo-alt me-2"></i>Location Details
                                    </h5>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">City</label>
                                            <select 
                                                className={`form-select shadow-sm ${errors.cityId ? 'is-invalid' : ''}`}
                                                name="cityId"
                                                value={formData.cityId}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">Select City</option>
                                                {citiesWithIds.map(city => (
                                                    <option key={city.id} value={city.id}>
                                                        {city.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.cityId && 
                                                <div className="invalid-feedback">{errors.cityId}</div>
                                            }
                                        </div>
                                        <div className="col-md-12">
                                            <label className="form-label fw-semibold">Address</label>
                                            <input 
                                                type="text" 
                                                className={`form-control shadow-sm ${errors.address ? 'is-invalid' : ''}`}
                                                name="address"
                                                value={formData.address || ''}
                                                onChange={handleInputChange}
                                                placeholder="Enter property address"
                                            />
                                            {errors.address && 
                                                <div className="invalid-feedback">{errors.address}</div>
                                            }
                                        </div>
                                    </div>
                                </div>

                                {/* Property Specifications Section */}
                                <div className="bg-light p-4 rounded-3 mb-4">
                                    <h5 className="mb-4 text-secondary fw-bold">
                                        <i className="bi bi-list-check me-2"></i>Property Specifications
                                    </h5>
                                    <div className="row">
                                        {formData.propertyTypeId && renderDynamicFields(formData.propertyTypeId)}
                                    </div>
                                </div>

                                {/* Property Description */}
                                <div className="bg-light p-4 rounded-3 mb-4">
                                    <h5 className="mb-4 text-secondary fw-bold">
                                        <i className="bi bi-file-text me-2"></i>Property Description
                                    </h5>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Description</label>
                                        <textarea 
                                            className={`form-control shadow-sm ${errors.description ? 'is-invalid' : ''}`}
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows="4"
                                            placeholder="Enter detailed property description including features, amenities, and highlights"
                                        />
                                        {errors.description && 
                                            <div className="invalid-feedback">{errors.description}</div>
                                        }
                                    </div>
                                </div>

                                {/* Media Upload */}
                                <div className="bg-light p-4 rounded-3 mb-4">
                                    <h5 className="mb-4 text-secondary fw-bold">
                                        <i className="bi bi-images me-2"></i>Property Images
                                    </h5>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Upload Images</label>
                                        <input 
                                            type="file" 
                                            className={`form-control shadow-sm ${errors.imageUrls ? 'is-invalid' : ''}`}
                                            onChange={handleImageUpload}
                                            accept="image/jpeg,image/png,image/jpg"
                                            multiple 
                                        />
                                        {errors.imageUrls && 
                                            <div className="invalid-feedback">{errors.imageUrls}</div>
                                        }
                                        <div className="form-text mt-2">
                                            <i className="bi bi-info-circle me-1"></i>
                                            Upload up to 10 images (JPEG, PNG only, max 5MB each)
                                        </div>
                                        {formData.imageUrls && (
                                            <div className="mt-3">
                                                <p className="mb-2 fw-semibold">Uploaded Images:</p>
                                                <div className="row g-2">
                                                    {formData.imageUrls.split(',').map((url, index) => (
                                                        <div key={index} className="col-md-3 col-6">
                                                            <img 
                                                                src={url} 
                                                                alt={`Property ${index + 1}`} 
                                                                className="img-thumbnail"
                                                                style={{ height: '150px', objectFit: 'cover' }}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="bg-light p-4 rounded-3 mb-4">
                                    <h5 className="mb-4 text-secondary fw-bold">
                                        <i className="bi bi-person-lines-fill me-2"></i>Contact Information
                                    </h5>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Owner Contact Number</label>
                                            <input 
                                                type="tel" 
                                                className={`form-control shadow-sm ${errors.ownerContactNo ? 'is-invalid' : ''}`}
                                                name="ownerContactNo"
                                                value={formData.ownerContactNo}
                                                onChange={handleInputChange}
                                                placeholder="Enter contact number"
                                            />
                                            {errors.ownerContactNo && 
                                                <div className="invalid-feedback">{errors.ownerContactNo}</div>
                                            }
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Owner Contact Email</label>
                                            <input 
                                                type="email" 
                                                className={`form-control shadow-sm ${errors.ownerContactEmail ? 'is-invalid' : ''}`}
                                                name="ownerContactEmail"
                                                value={formData.ownerContactEmail}
                                                onChange={handleInputChange}
                                                placeholder="Enter email address"
                                            />
                                            {errors.ownerContactEmail && 
                                                <div className="invalid-feedback">{errors.ownerContactEmail}</div>
                                            }
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" className="btn btn-primary btn-lg w-100 fw-bold">
                                    <i className="bi bi-check2-circle me-2"></i>
                                    {isEditMode ? 'Update Property' : 'Submit Property'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PostProperty;
