import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

function Properties() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [likedProperties, setLikedProperties] = useState([]);
    const [selectedBuyRent, setSelectedBuyRent] = useState("Buy");
    const [selectedPropertyType, setSelectedPropertyType] = useState("");
    const [selectedSubType, setSelectedSubType] = useState("");
    const [selectedCity, setSelectedCity] = useState("All Cities");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [subTypes, setSubTypes] = useState([]);
    const [allProperties, setAllProperties] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [selectedBHK, setSelectedBHK] = useState("BHK");
    const token = localStorage.getItem("token");
    const propertyTypes = [
        { id: 1, name: "Residential" },
        { id: 2, name: "Commercial" },
        { id: 3, name: "Land" },
        { id: 4, name: "Rental" },
    ];

    const propertySubTypes = {
        Residential: ["Apartment/Flat", "Independent House/Villa"],
        Commercial: ["Office Space", "Retail/Shop Space", "Warehouse/Godown"],
        Land: ["Residential Land", "Agricultural Land", "Commercial Land", "Industrial Plot"],
        Rental: ["Hostels", "PG", "Hotels/Resorts", "Apartment/Flat", "Independent House/Villa"],
    };

    // Fetch all properties on component mount
    useEffect(() => {
      
        const fetchProperties = async () => {
            try {
                const response = await fetch(
                    "https://localhost:7019/api/PropertiesApi/GetAllProperties",
                    {method:'GET',headers:{Authorization : `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZSI6ImRpdnllc2giLCJlbWFpbCI6ImRwQGdtYWlsLmNvbSIsImp0aSI6IjlhNjZiM2E3LTExYWQtNGEwZi05MzcyLWJhNDQxNjIzZGRlOCIsImV4cCI6MTczOTc2NjQ2MywiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NzAxOS8iLCJhdWQiOiJodHRwczovL2xvY2FsaG9zdDo3MDE5LyJ9.QnnAQINE4xFod_DDVi38zS8hVsb0KS5QurSra4364xs`}}
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
            
                setAllProperties(data);
                //   setFilteredData(data); // Initialize filtered data
            } catch (error) {
                console.error("Error in fetch:", error);
            }
        };

        fetchProperties();
    }, []);

    // Fetch liked properties when user is available
    useEffect(() => {
        const fetchLikedProperties = async () => {
            if (!user?.userId) return;
            
            try {
                const response = await fetch(
                    `https://localhost:7019/api/Likes/user/${user.userId}`
                );
                if (response.ok) {
                    const data = await response.json();
                    // Store the full like objects
                    setLikedProperties(data);
                }
            } catch (error) {
                console.error("Error fetching liked properties:", error);
            }
        };

        fetchLikedProperties();
    }, [user?.userId]);

    const handleLike = async (propertyId) => {
        if (!user) {
            alert('Please login to like properties');
            navigate('/login');
            return;
        }

        try {
            // Check if property is liked by checking propertyID in the likes array
            const isLiked = likedProperties.some(like => like.propertyID === propertyId);

            if (isLiked) {
                // Unlike
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
                // Like
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

    // Handle Buy/Rent change
    const handleBuyRentChange = (event) => {
        const value = event.target.value;
        setSelectedBuyRent(value);
        setSelectedPropertyType("");
        setSelectedSubType("");
        setSubTypes(value === "Rent" ? propertySubTypes["Rental"] : []);
    };

    // Handle Property Type change
    const handlePropertyTypeChange = (event) => {
        const value = event.target.value;
        setSelectedPropertyType(value);
        setSubTypes(propertySubTypes[value] || []);
        setSelectedSubType(""); // Reset subtype on type change
    };

    // Filter logic
    useEffect(() => {
        const filterData = () => {
            let filtered = [...allProperties];

            // Filter by Buy/Rent
            filtered = filtered.filter((property) =>
                selectedBuyRent === "Buy"
                    ? property.purpose === "Sale"
                    : property.purpose === "Rent"
            );

            // Filter by Property Type
            if (selectedPropertyType) {
                filtered = filtered.filter(
                    (property) =>
                        property.propertyTypeName == selectedPropertyType
                );
            }

            // Filter by Sub Type
            if (selectedSubType) {
                filtered = filtered.filter(
                    (property) => property.subTypeName === selectedSubType
                );
            }

            // Filter by City
            if (selectedCity !== "All Cities") {
                filtered = filtered.filter(
                    (property) => property.cityName === selectedCity
                );
            }

            // Filter by Min and Max Price
            if (minPrice) {
                filtered = filtered.filter(
                    (property) => parseFloat(property.price) >= parseFloat(minPrice)
                );
            }

            if (maxPrice) {
                filtered = filtered.filter(
                    (property) => parseFloat(property.price) <= parseFloat(maxPrice)
                );
            }

            if ((selectedBuyRent === "Buy" && selectedPropertyType == "Residential" && selectedBHK != "BHK")) {
                filtered = filtered.filter(
                    (property) => property.residentialDetails.bhk === selectedBHK
                );
            }

            console.log("filtered data", filtered)
            setFilteredData(filtered);
        };

        filterData();
    }, [
        selectedBuyRent,
        selectedPropertyType,
        selectedSubType,
        selectedCity,
        minPrice,
        maxPrice,
        allProperties,
        selectedBHK
    ]);

    const generatePropertyCards = (filteredData) => {
        return filteredData.map((property) => {
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

            // Prepare type-specific details
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

            // Check if property is liked by checking propertyID in the likes array
            const isLiked = likedProperties.some(like => like.propertyID === propertyId);

            return (
                <div className="col-12 col-md-6 col-xl-4 mb-4" key={propertyId}>
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
                                {/* Overlay Badges */}
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

                        {/* Main Content */}
                        <div className="card-body p-4 d-flex flex-column">
                            {/* Price and Location Section with Like Button */}
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
                            <p className="card-text text-muted small mb-2">
                                {description?.length > 120 ? `${description.substring(0, 120)}...` : description}
                            </p>

                            {/* Property Features */}
                            <div className="border-top pt-2">
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
            );
        });
    };

    // Add this CSS to your component or CSS file
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

    return (
        <>
            <section class="breadcumb-area bg-img" style={{ "background-image": "url(img/bg-img/hero1.jpg)" }}>
                <div class="container h-100">
                    <div class="row h-100 align-items-center">
                        <div class="col-12">
                            <div class="breadcumb-content">
                                <h3 class="breadcumb-title">Listings</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div class="south-search-area">
                <div class="container">
                    <div class="row">
                        <div class="col-12">
                            <div class="advanced-search-form">
                                <div class="search-title">
                                    <p>Search for your home</p>
                                </div>
                                <form action="#" method="post" id="advanceSearch">
                                    <div class="row">
                                        {/* Buy/Rent Select */}
                                        <div className="col-12 col-md-4 col-lg-3">
                                            <div className="form-group">
                                                <select
                                                    className="form-control"
                                                    id="BuyRent"
                                                    value={selectedBuyRent}
                                                    onChange={handleBuyRentChange}
                                                >
                                                    <option value="Buy">Buy</option>
                                                    <option value="Rent">Rent</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Cities Select */}
                                        <div className="col-12 col-md-4 col-lg-3">
                                            <div className="form-group">
                                                <select
                                                    className="form-control"
                                                    id="cities"
                                                    value={selectedCity}
                                                    onChange={(e) => setSelectedCity(e.target.value)}
                                                >
                                                    <option>All Cities</option>
                                                    <option>Ahmedabad</option>
                                                    <option>Surat</option>
                                                    <option>Vadodara</option>
                                                    <option>Rajkot</option>
                                                    <option>Rajkot</option>
                                                    <option>Gandhinagar</option>
                                                    <option>Bhavnagar</option>
                                                    <option>Jamnagar</option>
                                                    <option>Junagadh</option>
                                                    <option>Anand</option>
                                                    <option>Nadiad</option>
                                                    <option>Mehsana</option>
                                                    <option>Morbi</option>
                                                    <option>Surendranagar</option>
                                                    <option>Valsad</option>
                                                    <option>Bharuch</option>
                                                    <option>Navsari</option>
                                                    <option>Dahod</option>
                                                    <option>Patan</option>
                                                    <option>Palanpur</option>
                                                    <option>Porbandar</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Property Type Select */}
                                        {selectedBuyRent === "Buy" && (
                                            <div className="col-12 col-md-4 col-lg-3">
                                                <div className="form-group">
                                                    <select
                                                        className="form-control"
                                                        id="PropertyType"
                                                        value={selectedPropertyType}
                                                        onChange={handlePropertyTypeChange}
                                                    >
                                                        <option value="">Property Type</option>
                                                        {propertyTypes
                                                            .filter((type) => type.name !== "Rental")
                                                            .map((type) => (
                                                                <option key={type.id} value={type.name}>
                                                                    {type.name}
                                                                </option>
                                                            ))}
                                                    </select>
                                                </div>
                                            </div>
                                        )}

                                        {/* Sub Type Select */}
                                        {(selectedBuyRent === "Rent" || (selectedBuyRent === "Buy" && selectedPropertyType)) && (
                                            <div className="col-12 col-md-4 col-lg-3">
                                                <div className="form-group">
                                                    <select
                                                        className="form-control"
                                                        id="SubType"
                                                        value={selectedSubType}
                                                        onChange={(e) => setSelectedSubType(e.target.value)}
                                                    >
                                                        <option>Sub Type</option>
                                                        {subTypes.map((subType, index) => (
                                                            <option key={index} value={subType}>
                                                                {subType}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        )}

                                        {/* Min Price Input */}
                                        <div className="col-12 col-md-4 col-lg-3">
                                            <div className="form-group">
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    id="minprice"
                                                    placeholder="Min Price"
                                                    value={minPrice}
                                                    onChange={(e) => setMinPrice(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {/* Max Price Input */}
                                        <div className="col-12 col-md-4 col-lg-3">
                                            <div className="form-group">
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    id="maxprice"
                                                    placeholder="Max Price"
                                                    value={maxPrice}
                                                    onChange={(e) => setMaxPrice(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {/* BHK Select */}
                                        {(selectedBuyRent === "Buy" && selectedPropertyType == "Residential") && (
                                            <div className="col-12 col-md-4 col-lg-3">
                                                <div className="form-group">
                                                    <select
                                                        className="form-control"
                                                        id="bhk"
                                                        value={selectedBHK}
                                                        onChange={(e) => setSelectedBHK(e.target.value)}
                                                    >
                                                        <option value="BHK">BHK</option>
                                                        <option value="1">1BHK</option>
                                                        <option value="1">2BHK</option>
                                                        <option value="1">3BHK</option>
                                                        <option value="1">4BHK</option>
                                                        <option value="1">5BHK</option>
                                                    </select>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <section class="listings-content-wrapper section-padding-100">
                <div class="container">
                    <div class="row">
                        <div class="col-12">
                            <div class="listings-top-meta d-flex justify-content-between mb-100">
                                <div class="view-area d-flex align-items-center">
                                    <span>View as:</span>
                                    <div class="grid_view ml-15"><a href="#" class="active"><i class="fa fa-th" aria-hidden="true"></i></a></div>
                                    <div class="list_view ml-15"><a href="#"><i class="fa fa-th-list" aria-hidden="true"></i></a></div>
                                </div>
                                <div class="order-by-area d-flex align-items-center">
                                    <span class="mr-15">Order by:</span>
                                    <select>
                                        <option selected>Default</option>
                                        <option value="1">Newest</option>
                                        <option value="2">Sales</option>
                                        <option value="3">Ratings</option>
                                        <option value="3">Popularity</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        {generatePropertyCards(filteredData)}
                    </div>

                    <div class="row">
                        <div class="col-12">
                            <div class="south-pagination d-flex justify-content-end">
                                <nav aria-label="Page navigation">
                                    <ul class="pagination">
                                        <li class="page-item"><a class="page-link active" href="#">01</a></li>
                                        <li class="page-item"><a class="page-link" href="#">02</a></li>
                                        <li class="page-item"><a class="page-link" href="#">03</a></li>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default Properties;