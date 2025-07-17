import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function UserProfile() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [activeTab, setActiveTab] = useState('profile');
    const [userProperties, setUserProperties] = useState([]);
    const [likedProperties, setLikedProperties] = useState([]);
    const [allProperties, setAllProperties] = useState([]); // For storing all properties
    const [filteredLikedProperties, setFilteredLikedProperties] = useState([]); // For storing filtered liked properties
    const [users, setUsers] = useState([]);
    const [userPropertiesCounts, setUserPropertiesCounts] = useState({});
    const [selectedUserProperties, setSelectedUserProperties] = useState(null);
    const [selectedUserDetails, setSelectedUserDetails] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState({
        userName: user?.userName || '',
        email: user?.email || '',
        contactNo: user?.contactNo || ''
    });

    useEffect(() => {
        if (activeTab === 'properties' && user?.userId) {
            const fetchUserProperties = async () => {
                try {
                    const response = await fetch(
                        `https://localhost:7019/api/PropertiesApi/GetPropertiesByUser/${user.userId}`
                    );

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const data = await response.json();
                    console.log("User properties:", data);
                    setUserProperties(data);
                } catch (error) {
                    console.error("Error fetching user properties:", error);
                }
            };

            fetchUserProperties();
        }
    }, [activeTab, user?.userId]);

    useEffect(() => {
        const fetchLikedProperties = async () => {
            if (!user?.userId) return;
            
            try {
                const response = await fetch(
                    `https://localhost:7019/api/Likes/user/${user.userId}`
                );
                if (response.ok) {
                    const data = await response.json();
                    setLikedProperties(data);
                }
            } catch (error) {
                console.error("Error fetching liked properties:", error);
            }
        };

        fetchLikedProperties();
    }, [user?.userId]);

    useEffect(() => {
        const fetchAndFilterProperties = async () => {
            if (activeTab === 'likes' && likedProperties.length > 0) {
                try {
                    const response = await fetch(
                        'https://localhost:7019/api/PropertiesApi/GetAllProperties'
                    );
                    if (response.ok) {
                        const allPropertiesData = await response.json();
                        setAllProperties(allPropertiesData);

                        // Get array of liked property IDs
                        const likedPropertyIds = likedProperties.map(like => like.propertyID);

                        // Filter properties to get only liked ones
                        const filteredProperties = allPropertiesData.filter(property => 
                            likedPropertyIds.includes(property.propertyId)
                        );

                        setFilteredLikedProperties(filteredProperties);
                    }
                } catch (error) {
                    console.error("Error fetching all properties:", error);
                }
            }
        };

        fetchAndFilterProperties();
    }, [activeTab, likedProperties]);

    useEffect(() => {
        const fetchUsers = async () => {
            if (activeTab === 'users' && user?.isAdmin) {
                try {
                    const response = await fetch('https://localhost:7019/api/Users');
                    if (response.ok) {
                        const data = await response.json();
                        setUsers(data);
                    }
                } catch (error) {
                    console.error("Error fetching users:", error);
                }
            }
        };

        fetchUsers();
    }, [activeTab, user?.isAdmin]);

    useEffect(() => {
        const fetchUserPropertiesCounts = async () => {
            if (activeTab === 'users' && users.length > 0) {
                try {
                    const counts = {};
                    for (const user of users) {
                        const response = await fetch(
                            `https://localhost:7019/api/PropertiesApi/GetPropertiesByUser/${user.userId}`
                        );
                        if (response.ok) {
                            const properties = await response.json();
                            counts[user.userId] = properties.length;
                        }
                    }
                    setUserPropertiesCounts(counts);
                } catch (error) {
                    console.error("Error fetching property counts:", error);
                }
            }
        };

        fetchUserPropertiesCounts();
    }, [activeTab, users]);

    const handleLike = async (propertyId) => {
        if (!user) {
            alert('Please login to like properties');
            navigate('/login');
            return;
        }

        try {
            const isLiked = likedProperties.some(like => like.propertyID === propertyId);

            if (isLiked) {
                const response = await fetch(
                    `https://localhost:7019/api/Likes/${user.userId}/${propertyId}`,
                    {
                        method: 'DELETE'
                    }
                );
                if (response.ok) {
                    setLikedProperties(prev => prev.filter(like => like.propertyID !== propertyId));
                }
            } else {
                const response = await fetch(
                    'https://localhost:7019/api/Likes',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            userId: user.userId,
                            propertyId: propertyId
                        })
                    }
                );
                if (response.ok) {
                    const newLike = {
                        userID: user.userId,
                        propertyID: propertyId,
                        likedAt: new Date().toISOString()
                    };
                    setLikedProperties(prev => [...prev, newLike]);
                }
            }
        } catch (error) {
            console.error("Error handling like:", error);
        }
    };

    const generatePropertyCards = (properties) => {
        return properties.map((property) => {
            const isLiked = likedProperties.some(like => like.propertyID === property.propertyId);
            const {
                propertyId,
                purpose,
                price,
                cityName,
                propertyTypeName,
                address,
                description,
                imageUrlList,
                residentialDetails,
                rentalDetails,
                commercialDetails,
                landDetails,
                subTypeName
            } = property;

            let bathrooms = null;
            let parkingAvailable = null;
            let area = null;
            let landarea = null;
            let bhk = null;
            let Furnishing = null;
            let balconies = null;
            let beds = null;
            let services = null;
            let zoningType = null;
            let roadaccess = null;

            if (residentialDetails) {
                balconies = residentialDetails.balconies;
                Furnishing = residentialDetails.furnishingStatus;
                bhk = residentialDetails.bhk;
                bathrooms = residentialDetails.bathrooms;
                parkingAvailable = residentialDetails.parkingAvailable ? "Available" : "Not Available";
            } else if (commercialDetails) {
                area = `${commercialDetails.carpetArea} sq ft`;
            } else if (landDetails) {
                landarea = `${landDetails.plotArea} sq ft`;
                zoningType = landDetails.zoningType;
                roadaccess = landDetails.roadAccess ? "Yes" : "No";
            } else if (rentalDetails) {
                beds = rentalDetails.totalBeds;
                services = rentalDetails.services;
            }

            return (
                <div className="property-link col-12 col-md-6 col-xl-4 mb-4" key={propertyId}>
                    <div className="card h-100 border-0 shadow-lg d-flex flex-column rounded-4 overflow-hidden position-relative property-card">
                        {/* Image Container with Link */}
                        <Link to={`/PropertyDetails/${propertyId}`}>
                            <div className="position-relative overflow-hidden">
                                <img
                                    src={imageUrlList && imageUrlList[0] ? imageUrlList[0] : "img/bg-img/placeholder.jpg"}
                                    alt={address}
                                    className="card-img-top"
                                    style={{ height: "250px", objectFit: "cover" }}
                                />
                                <div className="position-absolute top-0 start-0 w-100 p-3 d-flex justify-content-between align-items-start">
                                    <span className="badge bg-dark bg-opacity-75 px-3 py-2 rounded-pill">
                                        For {purpose}
                                    </span>
                                    <span className="badge bg-primary bg-opacity-75 px-3 py-2 rounded-pill">
                                        {propertyTypeName}
                                    </span>
                                </div>
                            </div>
                        </Link>

                        <div className="card-body p-4 d-flex flex-column">
                            {/* Content Container */}
                            <div className="flex-grow-1">
                                {/* Price and Location Section */}
                                <div className="mb-2 d-flex justify-content-between align-items-start">
                                    <div>
                                        <h4 className="mb-1 fw-bold text-dark">
                                            ₹{price.toLocaleString()}
                                        </h4>
                                        <p className="mb-0 text-muted">
                                            <i className="bi bi-geo-alt-fill me-1 text-danger"></i>
                                            {address}, {cityName}
                                        </p>
                                    </div>
                                    <button 
                                        className="btn btn-link p-0"
                                        onClick={() => handleLike(propertyId)}
                                        style={{ fontSize: '1.5rem' }}
                                    >
                                        {isLiked ? (
                                            <i className="bi bi-heart-fill text-danger"></i>
                                        ) : (
                                            <i className="bi bi-heart text-dark"></i>
                                        )}
                                    </button>
                                </div>

                                {/* Property Title and Description */}
                                <h5 className="card-title mb-2 text-primary">
                                    {subTypeName}
                                </h5>
                                <p className="card-text text-muted small mb-3">
                                    {description?.length > 120 ? `${description.substring(0, 120)}...` : description}
                                </p>

                                {/* Property Features */}
                                <div className="border-top pt-3">
                                    <div className="row g-0">
                                        {/* Residential Details */}
                                        {bathrooms !== null && (
                                            <>
                                                <div className="col-3 text-center border-end">
                                                    <div className="d-flex flex-column">
                                                        <small className="text-muted mb-1">BHK</small>
                                                        <span className="fw-semibold">{bhk}</span>
                                                    </div>
                                                </div>
                                                <div className="col-3 text-center border-end">
                                                    <div className="d-flex flex-column">
                                                        <small className="text-muted mb-1">Type</small>
                                                        <span className="fw-semibold">{Furnishing}</span>
                                                    </div>
                                                </div>
                                                <div className="col-3 text-center border-end">
                                                    <div className="d-flex flex-column">
                                                        <small className="text-muted mb-1">Parking</small>
                                                        <span className="fw-semibold">{parkingAvailable}</span>
                                                    </div>
                                                </div>
                                                <div className="col-3 text-center">
                                                    <div className="d-flex flex-column">
                                                        <small className="text-muted mb-1">Balcony</small>
                                                        <span className="fw-semibold">{balconies}</span>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {/* Rental Details */}
                                        {beds !== null && (
                                            <>
                                                <div className="col-6 text-center border-end">
                                                    <div className="d-flex flex-column">
                                                        <small className="text-muted mb-1">Beds</small>
                                                        <span className="fw-semibold">{beds}</span>
                                                    </div>
                                                </div>
                                                <div className="col-6 text-center">
                                                    <div className="d-flex flex-column">
                                                        <small className="text-muted mb-1">Services</small>
                                                        <span className="fw-semibold">{services}</span>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {/* Commercial Details */}
                                        {area !== null && (
                                            <div className="col-12 text-center">
                                                <div className="d-flex flex-column">
                                                    <small className="text-muted mb-1">Total Area</small>
                                                    <span className="fw-semibold">{area}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Land Details */}
                                        {landarea !== null && (
                                            <>
                                                <div className="col-4 text-center border-end">
                                                    <div className="d-flex flex-column">
                                                        <small className="text-muted mb-1">Plot Area</small>
                                                        <span className="fw-semibold">{landarea}</span>
                                                    </div>
                                                </div>
                                                <div className="col-4 text-center border-end">
                                                    <div className="d-flex flex-column">
                                                        <small className="text-muted mb-1">Zoning</small>
                                                        <span className="fw-semibold">{zoningType}</span>
                                                    </div>
                                                </div>
                                                <div className="col-4 text-center">
                                                    <div className="d-flex flex-column">
                                                        <small className="text-muted mb-1">Road</small>
                                                        <span className="fw-semibold">{roadaccess}</span>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons - Always at bottom */}
                            <div className="mt-auto pt-3 border-top">
                                <div className="d-flex justify-content-between gap-2">
                                    <button 
                                        className="btn btn-warning flex-grow-1"
                                        onClick={() => handleEditProperty(propertyId)}
                                    >
                                        <i className="bi bi-pencil-fill me-1"></i> Edit
                                    </button>
                                    <button 
                                        className="btn btn-danger flex-grow-1"
                                        onClick={() => handleDeleteProperty(propertyId)}
                                    >
                                        <i className="bi bi-trash-fill me-1"></i> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        });
    };

    const MyPropertiesContent = (
        <div className="card-body p-4">
            <h4 className="mb-4">My Properties</h4>
            <div className="properties-scroll" style={{ 
                maxHeight: "calc(100vh - 200px)", 
                overflowY: "auto",
                overflowX: "hidden"
            }}>
                <div className="row mx-0">
                    {userProperties.length > 0 ? (
                        generatePropertyCards(userProperties)
                    ) : (
                        <div className="col-12 text-center">
                            <p>No properties found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    // Add these functions to handle edit and delete actions
    const handleEditProperty = (propertyId) => {
        navigate(`/postproperty?edit=${propertyId}`);
    };

    const handleDeleteProperty = async (propertyId) => {
        if (window.confirm('Are you sure you want to delete this property?')) {
            try {
                const response = await fetch(
                    `https://localhost:7019/api/PropertiesApi/DeleteProperty/${propertyId}`,
                    {
                        method: 'DELETE',
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                // Remove the deleted property from the state
                setUserProperties(prevProperties => 
                    prevProperties.filter(property => property.propertyId !== propertyId)
                );
             
                if(selectedUserProperties != null){
                    setSelectedUserProperties(prevProperties => 
                        prevProperties.filter(property => property.propertyId !== propertyId)
                    );
                }

                alert('Property deleted successfully!');
            } catch (error) {
                console.error("Error deleting property:", error);
                alert('Failed to delete property. Please try again.');
            }
        }
    };

    // New function for generating liked property cards (without edit/delete buttons)
    const generateLikedPropertyCards = (properties) => {
        return properties.map((property) => {
            const {
                propertyId,
                purpose,
                price,
                cityName,
                propertyTypeName,
                address,
                description,
                imageUrlList,
                residentialDetails,
                rentalDetails,
                commercialDetails,
                landDetails,
                subTypeName
            } = property;

            let bathrooms = null;
            let parkingAvailable = null;
            let area = null;
            let landarea = null;
            let bhk = null;
            let Furnishing = null;
            let balconies = null;
            let beds = null;
            let services = null;
            let zoningType = null;
            let roadaccess = null;

            if (residentialDetails) {
                balconies = residentialDetails.balconies;
                Furnishing = residentialDetails.furnishingStatus;
                bhk = residentialDetails.bhk;
                bathrooms = residentialDetails.bathrooms;
                parkingAvailable = residentialDetails.parkingAvailable ? "Available" : "Not Available";
            } else if (commercialDetails) {
                area = `${commercialDetails.carpetArea} sq ft`;
            } else if (landDetails) {
                landarea = `${landDetails.plotArea} sq ft`;
                zoningType = landDetails.zoningType;
                roadaccess = landDetails.roadAccess ? "Yes" : "No";
            } else if (rentalDetails) {
                beds = rentalDetails.totalBeds;
                services = rentalDetails.services;
            }

            const isLiked = likedProperties.some(like => like.propertyID === propertyId);

            return (
                <div className="property-link col-12 col-md-6 col-xl-4 mb-4" key={propertyId}>
                    <div className="card h-100 border-0 shadow-lg d-flex flex-column rounded-4 overflow-hidden position-relative property-card">
                        {/* Image Container with Link */}
                        <Link to={`/PropertyDetails/${propertyId}`}>
                            <div className="position-relative overflow-hidden">
                                <img
                                    src={imageUrlList && imageUrlList[0] ? imageUrlList[0] : "img/bg-img/placeholder.jpg"}
                                    alt={address}
                                    className="card-img-top"
                                    style={{ height: "250px", objectFit: "cover" }}
                                />
                                <div className="position-absolute top-0 start-0 w-100 p-3 d-flex justify-content-between align-items-start">
                                    <span className="badge bg-dark bg-opacity-75 px-3 py-2 rounded-pill">
                                        For {purpose}
                                    </span>
                                    <span className="badge bg-primary bg-opacity-75 px-3 py-2 rounded-pill">
                                        {propertyTypeName}
                                    </span>
                                </div>
                            </div>
                        </Link>

                        <div className="card-body p-4 d-flex flex-column">
                            {/* Content Container */}
                            <div className="flex-grow-1">
                                {/* Price and Location Section */}
                                <div className="mb-2 d-flex justify-content-between align-items-start">
                                    <div>
                                        <h4 className="mb-1 fw-bold text-dark">
                                            ₹{price.toLocaleString()}
                                        </h4>
                                        <p className="mb-0 text-muted">
                                            <i className="bi bi-geo-alt-fill me-1 text-danger"></i>
                                            {address}, {cityName}
                                        </p>
                                    </div>
                                    <button 
                                        className="btn btn-link p-0"
                                        onClick={() => handleLike(propertyId)}
                                        style={{ fontSize: '1.5rem' }}
                                    >
                                        {isLiked ? (
                                            <i className="bi bi-heart-fill text-danger"></i>
                                        ) : (
                                            <i className="bi bi-heart text-dark"></i>
                                        )}
                                    </button>
                                </div>

                                {/* Property Title and Description */}
                                <h5 className="card-title mb-2 text-primary">
                                    {subTypeName}
                                </h5>
                                <p className="card-text text-muted small mb-3">
                                    {description?.length > 120 ? `${description.substring(0, 120)}...` : description}
                                </p>

                                {/* Property Features */}
                                <div className="border-top pt-3">
                                    <div className="row g-0">
                                        {/* Residential Details */}
                                        {bathrooms !== null && (
                                            <>
                                                <div className="col-3 text-center border-end">
                                                    <div className="d-flex flex-column">
                                                        <small className="text-muted mb-1">BHK</small>
                                                        <span className="fw-semibold">{bhk}</span>
                                                    </div>
                                                </div>
                                                <div className="col-3 text-center border-end">
                                                    <div className="d-flex flex-column">
                                                        <small className="text-muted mb-1">Type</small>
                                                        <span className="fw-semibold">{Furnishing}</span>
                                                    </div>
                                                </div>
                                                <div className="col-3 text-center border-end">
                                                    <div className="d-flex flex-column">
                                                        <small className="text-muted mb-1">Parking</small>
                                                        <span className="fw-semibold">{parkingAvailable}</span>
                                                    </div>
                                                </div>
                                                <div className="col-3 text-center">
                                                    <div className="d-flex flex-column">
                                                        <small className="text-muted mb-1">Balcony</small>
                                                        <span className="fw-semibold">{balconies}</span>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {/* Rental Details */}
                                        {beds !== null && (
                                            <>
                                                <div className="col-6 text-center border-end">
                                                    <div className="d-flex flex-column">
                                                        <small className="text-muted mb-1">Beds</small>
                                                        <span className="fw-semibold">{beds}</span>
                                                    </div>
                                                </div>
                                                <div className="col-6 text-center">
                                                    <div className="d-flex flex-column">
                                                        <small className="text-muted mb-1">Services</small>
                                                        <span className="fw-semibold">{services}</span>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {/* Commercial Details */}
                                        {area !== null && (
                                            <div className="col-12 text-center">
                                                <div className="d-flex flex-column">
                                                    <small className="text-muted mb-1">Total Area</small>
                                                    <span className="fw-semibold">{area}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Land Details */}
                                        {landarea !== null && (
                                            <>
                                                <div className="col-4 text-center border-end">
                                                    <div className="d-flex flex-column">
                                                        <small className="text-muted mb-1">Plot Area</small>
                                                        <span className="fw-semibold">{landarea}</span>
                                                    </div>
                                                </div>
                                                <div className="col-4 text-center border-end">
                                                    <div className="d-flex flex-column">
                                                        <small className="text-muted mb-1">Zoning</small>
                                                        <span className="fw-semibold">{zoningType}</span>
                                                    </div>
                                                </div>
                                                <div className="col-4 text-center">
                                                    <div className="d-flex flex-column">
                                                        <small className="text-muted mb-1">Road</small>
                                                        <span className="fw-semibold">{roadaccess}</span>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        });
    };

    // Update the LikedPropertiesContent to use the new card generator
    const LikedPropertiesContent = (
        <div className="card-body p-4">
            <h4 className="mb-4">Liked Properties</h4>
            <div className="properties-scroll" style={{ 
                maxHeight: "calc(100vh - 200px)", 
                overflowY: "auto",
                overflowX: "hidden"
            }}>
                <div className="row mx-0">
                    {filteredLikedProperties.length > 0 ? (
                        generateLikedPropertyCards(filteredLikedProperties)
                    ) : (
                        <div className="col-12 text-center">
                            <p>No liked properties found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    // Add navigation function for Post Property
    const handlePostProperty = () => {
        navigate('/postproperty');
    };

    // Add function to handle property count click
    const handlePropertyCountClick = async (userId, userDetails) => {
        try {
            const response = await fetch(
                `https://localhost:7019/api/PropertiesApi/GetPropertiesByUser/${userId}`
            );
            if (response.ok) {
                const properties = await response.json();
                setSelectedUserProperties(properties);
                setSelectedUserDetails(userDetails);
            }
        } catch (error) {
            console.error("Error fetching user properties:", error);
        }
    };

    // Add function to go back to users list
    const handleBackToUsers = () => {
        setSelectedUserProperties(null);
        setSelectedUserDetails(null);
    };

    // Add new component for selected user properties
    const SelectedUserPropertiesContent = (
        <div className="card-body p-4">
            <div className="d-flex align-items-center mb-4">
                <button 
                    className="btn btn-link text-dark p-0 me-3"
                    onClick={handleBackToUsers}
                >
                    <i className="bi bi-arrow-left fs-4"></i>
                </button>
                <div>
                    <h4 className="mb-1">{selectedUserDetails?.userName}'s Properties</h4>
                    <p className="text-muted mb-0">
                        Email: {selectedUserDetails?.email} | 
                        Phone: {selectedUserDetails?.contactNo || 'N/A'} | 
                        Role: {selectedUserDetails?.isAdmin === true ? 'Admin' : 'User'}
                    </p>
                </div>
            </div>
            <div className="properties-scroll" style={{ 
                maxHeight: "calc(100vh - 200px)", 
                overflowY: "auto",
                overflowX: "hidden"
            }}>
                <div className="row mx-0">
                    {selectedUserProperties?.length > 0 ? (
                        generatePropertyCards(selectedUserProperties)
                    ) : (
                        <div className="col-12 text-center">
                            <p>No properties found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    // Update the properties count cell to be clickable
    // In the users table, update the properties count cell:
    <td className="text-center">
        <button 
            className="btn btn-link text-dark p-0"
            onClick={() => handlePropertyCountClick(user.userId, user)}
            style={{ textDecoration: 'none' }}
        >
            <span>
                {userPropertiesCounts[user.userId] || 0}
            </span>
        </button>
    </td>

    // Update the UsersContent component to conditionally render
    const UsersContent = (
        <div className="card-body p-4">
            {selectedUserProperties ? (
                SelectedUserPropertiesContent
            ) : (
                <>
                    <h4 className="mb-4">Users</h4>
                    <div className="properties-scroll" style={{ 
                        maxHeight: "calc(100vh - 200px)", 
                        overflowY: "auto",
                        overflowX: "hidden"
                    }}>
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="bg-light">
                                    <tr>
                                        <th scope="col" className="border-0 text-center">
                                            <div className="d-flex align-items-center justify-content-center">
                                                Sr No.
                                            </div>
                                        </th>
                                        <th scope="col" className="border-0 text-center">
                                            <div className="d-flex align-items-center justify-content-center">
                                                User Details
                                            </div>
                                        </th>
                                        <th scope="col" className="border-0 text-center">
                                            <div className="d-flex align-items-center justify-content-center">
                                                <i className="bi bi-envelope me-2"></i>
                                                Email
                                            </div>
                                        </th>
                                        <th scope="col" className="border-0 text-center">
                                            <div className="d-flex align-items-center justify-content-center">
                                                <i className="bi bi-telephone me-2"></i>
                                                Phone
                                            </div>
                                        </th>
                                        <th scope="col" className="border-0 text-center">
                                            <div className="d-flex align-items-center justify-content-center">
                                                <i className="bi bi-shield-check me-2"></i>
                                                Role
                                            </div>
                                        </th>
                                        <th scope="col" className="border-0 text-center">
                                            <div className="d-flex align-items-center justify-content-center">
                                                <i className="bi bi-house-door me-2"></i>
                                                Properties
                                            </div>
                                        </th>
                                        <th scope="col" className="border-0 text-center">
                                            <div className="d-flex align-items-center justify-content-center">
                                                <i className="bi bi-gear me-2"></i>
                                                Actions
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user, index) => (
                                        <tr key={user.userId} className="align-middle">
                                            <td className="text-center">
                                                <span className="fw-medium">{index + 1}</span>
                                            </td>
                                            <td className="text-center">
                                                <div>
                                                    <p className="fw-bold mb-0">{user.userName}</p>
                                                    <small className="text-muted">ID: {user.userId}</small>
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                <div className="text-truncate" style={{ maxWidth: '200px' }}>
                                                    {user.email}
                                                </div>
                                            </td>
                                            <td className="text-center">{user.contactNo || 'N/A'}</td>
                                            <td className="text-center">
                                                <span className={`badge ${user.admin === true ? 'bg-success' : 'bg-info'} rounded-pill`}>
                                                    {user.admin === true ? 'Admin' : 'User'}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <button 
                                                    className="btn btn-link text-dark p-0"
                                                    onClick={() => handlePropertyCountClick(user.userId, user)}
                                                    style={{ textDecoration: 'none' }}
                                                >
                                                    <span>
                                                        {userPropertiesCounts[user.userId] || 0}
                                                    </span>
                                                </button>
                                            </td>
                                            <td className="text-center">
                                                <div className="btn-group">
                                                    <button 
                                                        className="btn btn-outline-primary btn-sm"
                                                        title="Edit User"
                                                    >
                                                        <i className="bi bi-pencil"></i>
                                                    </button>
                                                    <button 
                                                        className="btn btn-outline-danger btn-sm ms-2"
                                                        title="Delete User"
                                                        onClick={() => handleDeleteUser(user.userId)}
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );

    // Add this CSS to your component
    const linkStyles = `
        .property-link {
            text-decoration: none !important;
            color: inherit !important;
        }
        
        .property-link:hover {
            text-decoration: none !important;
            color: inherit !important;
        }
    `;

    // Add useEffect to inject the styles
    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.innerText = linkStyles;
        document.head.appendChild(styleSheet);
        return () => {
            document.head.removeChild(styleSheet);
        };
    }, []);

    // Add this new function before the UsersContent component
    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                const response = await fetch(
                    `https://localhost:7019/api/Users/${userId}`,
                    {
                        method: 'DELETE'
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                // Remove the deleted user from the state
                setUsers(prevUsers => 
                    prevUsers.filter(user => user.userId !== userId)
                );

                alert('User deleted successfully!');
            } catch (error) {
                console.error("Error deleting user:", error);
                alert('Failed to delete user. Please try again.');
            }
        }
    };

    console.log("editedUser",editedUser,user);
    // Add this new function to handle the update
    const handleUpdateProfile = async () => {
        if (isEditing) {
            try {
                // Create the update object with correct casing to match C# model
                const updateData = {
                    UserId: user.userId,
                    UserName: editedUser.userName,
                    Email: editedUser.email,
                    ContactNo: editedUser.contactNo || null,
                    Admin: user.isAdmin // Make sure this matches the stored boolean value
                };

                console.log("editedUser",editedUser,user);
                console.log("Sending update data:", updateData);

                const response = await fetch(
                   
                    `https://localhost:7019/api/Users/${user.userId}`,
                    {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(updateData)
                    }
                );

                if (!response.ok) {
                    const errorData = await response.text();
                    console.error("Server response:", errorData);
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                // Update local storage with new user data
                const updatedUser = {
                    ...user,
                    userName: editedUser.userName,
                    email: editedUser.email,
                    contactNo: editedUser.contactNo
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));

                alert('Profile updated successfully!');
            } catch (error) {
                console.error("Error updating profile:", error);
                alert('Failed to update profile. Please try again.');
                return;
            }
        }
        setIsEditing(!isEditing);
    };

    return (
        <div className="container py-5">
            <div className="row">
                {/* Profile Sidebar */}
                <div className="col-lg-3 mb-4">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body text-center p-4">
                            <div className="mb-3">
                                <div className="d-flex justify-content-center">
                                    <div 
                                        className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                                        style={{ width: '100px', height: '100px', fontSize: '2.5rem' }}
                                    >
                                        {user?.userName ? user.userName.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                </div>
                            </div>
                            <h5 className="mb-1">{user?.userName || 'User'}</h5>
                            <p className="text-muted small mb-3">{user?.email || 'No email provided'}</p>
                            <button className="btn btn-outline-primary btn-sm w-100">Edit Profile</button>
                        </div>
                        <div className="list-group list-group-flush">
                            <button 
                                className={`list-group-item list-group-item-action ${activeTab === 'profile' ? 'active' : ''}`}
                                onClick={() => setActiveTab('profile')}
                            >
                                <i className="fa fa-user me-2"></i> Profile Details
                            </button>
                            <button 
                                className={`list-group-item list-group-item-action ${activeTab === 'properties' ? 'active' : ''}`}
                                onClick={() => setActiveTab('properties')}
                            >
                                <i className="fa fa-home me-2"></i> My Properties
                            </button>
                            <button 
                                className={`list-group-item list-group-item-action ${activeTab === 'likes' ? 'active' : ''}`}
                                onClick={() => setActiveTab('likes')}
                            >
                                <i className="fa fa-heart me-2"></i> Liked Properties
                            </button>
                            {/* Users tab - only shown for admin */}
                            {user?.isAdmin === true && (
                                <button
                                    className={`list-group-item list-group-item-action ${activeTab === 'users' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('users')}
                                    style={{ textDecoration: 'none' }}
                                >
                                    <i className="bi bi-people-fill me-2"></i>
                                    Users
                                </button>
                            )}
                            {/* Post Property button */}
                            <button
                                className="btn btn-link text-start  py-2"
                                onClick={handlePostProperty}
                                style={{
                                    textDecoration: 'none',
                                    color: '#198754',
                                    transition: 'all 0.3s ease',
                                    fontWeight: '500'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = '#146c43';
                                    e.currentTarget.style.transform = 'translateX(5px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = '#198754';
                                    e.currentTarget.style.transform = 'translateX(0)';
                                }}
                            >
                                <i className="bi bi-plus-circle-fill me-2"></i>
                                Post Property
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="col-lg-9">
                    <div className="card border-0 shadow-sm">
                        {/* Profile Details */}
                        {activeTab === 'profile' && (
                            <div className="card-body p-4">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h4>Profile Details</h4>
                                    <button 
                                        className={`btn ${isEditing ? 'btn-success' : 'btn-primary'}`}
                                        onClick={handleUpdateProfile}
                                    >
                                        {isEditing ? 'Update Profile' : 'Edit Profile'}
                                    </button>
                                </div>
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label text-muted">User Name</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                value={isEditing ? editedUser.userName : user?.userName || ''} 
                                                onChange={(e) => setEditedUser({...editedUser, userName: e.target.value})}
                                                readOnly={!isEditing}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label text-muted">Email</label>
                                            <input 
                                                type="email" 
                                                className="form-control" 
                                                value={isEditing ? editedUser.email : user?.email || ''} 
                                                onChange={(e) => setEditedUser({...editedUser, email: e.target.value})}
                                                readOnly={!isEditing}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label text-muted">Phone</label>
                                            <input 
                                                type="tel" 
                                                className="form-control" 
                                                value={isEditing ? editedUser.contactNo : user?.contactNo || ''} 
                                                onChange={(e) => setEditedUser({...editedUser, contactNo: e.target.value})}
                                                readOnly={!isEditing}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* My Properties */}
                        {activeTab === 'properties' && MyPropertiesContent}

                        {/* Liked Properties */}
                        {activeTab === 'likes' && LikedPropertiesContent}

                        {/* Users Tab */}
                        {activeTab === 'users' && UsersContent}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserProfile;
