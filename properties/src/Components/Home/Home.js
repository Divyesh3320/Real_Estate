import React, { useState, useEffect } from "react";
import { useNavigate, Link } from 'react-router-dom';

function Home() {
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

    // Fetch all properties
    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const response = await fetch(
                    "https://localhost:7019/api/PropertiesApi/GetAllProperties"
                );
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setAllProperties(data);
            } catch (error) {
                console.error("Error in fetch:", error);
            }
        };
        fetchProperties();
    }, []);

    // Fetch liked properties
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
                    { method: 'DELETE' }
                );
                if (response.ok) {
                    setLikedProperties(prev => prev.filter(like => like.propertyID !== propertyId));
                }
            } else {
                const response = await fetch(
                    'https://localhost:7019/api/Likes',
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
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

    const handleBuyRentChange = (event) => {
        const value = event.target.value;
        setSelectedBuyRent(value);
        setSelectedPropertyType("");
        setSelectedSubType("");
        setSubTypes(value === "Rent" ? propertySubTypes["Rental"] : []);
    };

    const handlePropertyTypeChange = (event) => {
        const value = event.target.value;
        setSelectedPropertyType(value);
        setSubTypes(propertySubTypes[value] || []);
        setSelectedSubType("");
    };

    // Filter logic
    useEffect(() => {
        const filterData = () => {
            let filtered = [...allProperties];

            filtered = filtered.filter((property) =>
                selectedBuyRent === "Buy"
                    ? property.purpose === "Sale"
                    : property.purpose === "Rent"
            );

            if (selectedPropertyType) {
                filtered = filtered.filter(
                    (property) => property.propertyTypeName == selectedPropertyType
                );
            }

            if (selectedSubType) {
                filtered = filtered.filter(
                    (property) => property.subTypeName === selectedSubType
                );
            }

            if (selectedCity !== "All Cities") {
                filtered = filtered.filter(
                    (property) => property.cityName === selectedCity
                );
            }

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
        // Take only first 6 properties
        const displayProperties = filteredData.slice(0, 6);

        return (
            <>
                {displayProperties.map((property) => {
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

                                    <h5 className="card-title mb-2 text-primary">
                                        {subTypeName}
                                    </h5>
                                    <p className="card-text text-muted small mb-2">
                                        {description?.length > 120 ? `${description.substring(0, 120)}...` : description}
                                    </p>

                                    <div className="border-top pt-2">
                                        <div className="row g-0">
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

                                            {area !== null && (
                                                <div className="col-12 text-center">
                                                    <div className="d-flex flex-column">
                                                        <small className="text-muted mb-1">Total Area</small>
                                                        <span className="fw-semibold">{area}</span>
                                                    </div>
                                                </div>
                                            )}

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
                })}
                
                {filteredData.length > 6 && (
                    <div className="col-12 text-center mt-4">
                        <Link 
                            to="/properties" 
                            className="btn south-btn wow fadeInUp" 
                            data-wow-delay="500ms"
                            style={{
                                animation: 'pulse 2s infinite',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            View More Properties
                            <i className="fa fa-angle-right ml-2"></i>
                        </Link>
                    </div>
                )}
            </>
        );
    };

    // Update only the buttonStyles CSS
    const buttonStyles = `
        @keyframes pulse {
            0% {
                transform: scale(1);
                box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.7);
            }
            
            70% {
                transform: scale(1.05);
                box-shadow: 0 0 0 10px rgba(0, 123, 255, 0);
            }
            
            100% {
                transform: scale(1);
                box-shadow: 0 0 0 0 rgba(0, 123, 255, 0);
            }
        }

        .south-btn:hover {
            transform: translateY(-3px);
            transition: all 0.3s ease;
            background: linear-gradient(135deg, #947054 0%, #c5a07f 100%) !important;
            color: white !important;
            box-shadow: 0 5px 15px rgba(148, 112, 84, 0.4) !important;
        }
    `;

    // Add this useEffect to inject the styles
    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.innerText = buttonStyles;
        document.head.appendChild(styleSheet);
        return () => {
            document.head.removeChild(styleSheet);
        };
    }, []);

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

    return (
        <>
            {/* <div id="preloader">
                <div class="south-load"></div>
            </div>     */}

            <section className="hero-area">
                <div className="hero-slides owl-carousel">
                    <div className="single-hero-slide bg-img" style={{ backgroundImage: "url('/img/bg-img/hero1.jpg')" }}>
                        <div className="container h-100">
                            <div className="row h-100 align-items-center">
                                <div className="col-12">
                                    <div className="hero-slides-content">
                                        <h2 data-animation="fadeInUp" data-delay="100ms">Find your home</h2>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="single-hero-slide bg-img" style={{ backgroundImage: "url('/img/bg-img/hero2.jpg')" }}>
                        <div className="container h-100">
                            <div className="row h-100 align-items-center">
                                <div className="col-12">
                                    <div className="hero-slides-content">
                                        <h2 data-animation="fadeInUp" data-delay="100ms">Find your dream house</h2>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="single-hero-slide bg-img" style={{ backgroundImage: "url('/img/bg-img/hero3.jpg')" }}>
                        <div className="container h-100">
                            <div className="row h-100 align-items-center">
                                <div className="col-12">
                                    <div className="hero-slides-content">
                                        <h2 data-animation="fadeInUp" data-delay="100ms">Find your perfect house</h2>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="south-search-area">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="advanced-search-form">
                                <div className="search-title">
                                    <p>Search for your home</p>
                                </div>
                                <form action="#" method="post" id="advanceSearch">
                                    <div className="row">
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
                                                        <option value="2">2BHK</option>
                                                        <option value="3">3BHK</option>
                                                        <option value="4">4BHK</option>
                                                        <option value="5">5BHK</option>
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

            <section className="listings-content-wrapper section-padding-100">
                <div className="container">
                    <div className="row">
                        {generatePropertyCards(filteredData)}
                    </div>
                </div>
            </section>

            <section className="call-to-action-area bg-fixed bg-overlay-black" style={{"background-image": "url(img/bg-img/cta.jpg)"}}>
                <div className="container h-100">
                    <div className="row align-items-center h-100">
                        <div className="col-12">
                            <div className="cta-content text-center">
                                <h2 className="wow fadeInUp" data-wow-delay="300ms">Are you looking for a place to rent?</h2>
                                <h6 className="wow fadeInUp" data-wow-delay="400ms">Suspendisse dictum enim sit amet libero malesuada feugiat.</h6>
                                <a href="#" className="btn south-btn mt-50 wow fadeInUp" data-wow-delay="500ms">Search</a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="south-testimonials-area section-padding-100">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="section-heading wow fadeInUp" data-wow-delay="250ms">
                                <h2>Client testimonials</h2>
                                <p>Suspendisse dictum enim sit amet libero malesuada feugiat.</p>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-12">
                            <div className="testimonials-slides owl-carousel wow fadeInUp" data-wow-delay="500ms">
                                <div className="single-testimonial-slide text-center">
                                    <h5>Perfect Home for me</h5>
                                    <p>Etiam nec odio vestibulum est mattis effic iturut magna. Pellentesque sit amet tellus blandit. Etiam nec odio vestibulum est mattis effic iturut magna. Pellentesque sit am et tellus blandit. Etiam nec odio vestibul. Etiam nec odio vestibulum est mat tis effic iturut magna.</p>

                                    <div className="testimonial-author-info">
                                        <img src="img/bg-img/feature6.jpg" alt=""/>
                                        <p>Daiane Smith, <span>Customer</span></p>
                                    </div>
                                </div>

                                <div className="single-testimonial-slide text-center">
                                    <h5>Perfect Home for me</h5>
                                    <p>Etiam nec odio vestibulum est mattis effic iturut magna. Pellentesque sit amet tellus blandit. Etiam nec odio vestibulum est mattis effic iturut magna. Pellentesque sit am et tellus blandit. Etiam nec odio vestibul. Etiam nec odio vestibulum est mat tis effic iturut magna.</p>

                                    <div className="testimonial-author-info">
                                        <img src="img/bg-img/feature6.jpg" alt=""/>
                                        <p>Daiane Smith, <span>Customer</span></p>
                                    </div>
                                </div>

                                <div className="single-testimonial-slide text-center">
                                    <h5>Perfect Home for me</h5>
                                    <p>Etiam nec odio vestibulum est mattis effic iturut magna. Pellentesque sit amet tellus blandit. Etiam nec odio vestibulum est mattis effic iturut magna. Pellentesque sit am et tellus blandit. Etiam nec odio vestibul. Etiam nec odio vestibulum est mat tis effic iturut magna.</p>

                                    <div className="testimonial-author-info">
                                        <img src="img/bg-img/feature6.jpg" alt=""/>
                                        <p>Daiane Smith, <span>Customer</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="south-editor-area d-flex align-items-center">
                <div className="editor-content-area">
                    <div className="section-heading wow fadeInUp" data-wow-delay="250ms">
                        <img src="img/icons/prize.png" alt=""/>
                        <h2>jeremy Scott</h2>
                        <p>Realtor</p>
                    </div>
                    <p className="wow fadeInUp" data-wow-delay="500ms">Etiam nec odio vestibulum est mattis effic iturut magna. Pellentesque sit amet tellus blandit. Etiam nec odiomattis effic iturut magna. Pellentesque sit am et tellus blandit. Etiam nec odio vestibul. Etiam nec odio vestibulum est mat tis effic iturut magna. Curabitur rhoncus auctor eleifend. Fusce venenatis diam urna, eu pharetra arcu varius ac. Etiam cursus turpis lectus, id iaculis risus tempor id. Phasellus fringilla nisl sed sem scelerisque, eget aliquam magna vehicula.</p>
                    <div className="address wow fadeInUp" data-wow-delay="750ms">
                        <h6><img src="img/icons/phone-call.png" alt=""/> +45 677 8993000 223</h6>
                        <h6><img src="img/icons/envelope.png" alt=""/> office@template.com</h6>
                    </div>
                    <div className="signature mt-50 wow fadeInUp" data-wow-delay="1000ms">
                        <img src="img/core-img/signature.png" alt=""/>
                    </div>
                </div>

                <div className="editor-thumbnail">
                    <img src="img/bg-img/editor.jpg" alt=""/>
                </div>
            </section>
        </>
    );
}

export default Home;