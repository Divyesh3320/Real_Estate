import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import "react-image-gallery/styles/css/image-gallery.css";
import ImageGallery from 'react-image-gallery';

function PropertyDetails() {
    const { id } = useParams();
    const [property, setProperty] = useState(null);
    const [images, setImages] = useState([]);

    useEffect(() => {
        const fetchPropertyDetails = async () => {
            try {
                const response = await fetch(`https://localhost:7019/api/PropertiesApi/GetPropertyById/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setProperty(data);
                    
                    // Format images for the gallery
                    if (data.imageUrlList) {
                        const formattedImages = data.imageUrlList.map(url => ({
                            original: url,
                            thumbnail: url,
                        }));
                        setImages(formattedImages);
                    }
                }
            } catch (error) {
                console.error("Error fetching property details:", error);
            }
        };

        fetchPropertyDetails();
    }, [id]);

    if (!property) {
        return <div className="container mt-5 text-center">Loading...</div>;
    }

    console.log("pro",property);

    return (
        <div className="container-fluid py-5">
            {/* Image Gallery Section */}
            <div className="container mb-5">
                <div className="row">
                    <div className="col-12">
                        <ImageGallery 
                            items={images}
                            showPlayButton={false}
                            showFullscreenButton={true}
                            showNav={true}
                            thumbnailPosition="bottom"
                            slideInterval={3000}
                            slideOnThumbnailOver={true}
                            additionalClass="custom-image-gallery"
                        />
                    </div>
                </div>
            </div>

            {/* Property Details Section */}
            <div className="container">
                <div className="row">
                    {/* Main Details */}
                    <div className="col-lg-8">
                        <div className="card shadow-sm mb-4">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h2 className="mb-0">{property.propertyTypeName} for {property.purpose}</h2>
                                    <h3 className="text-primary mb-0">₹{property.price}</h3>
                                </div>
                                <p className="text-muted">
                                    <i className="bi bi-geo-alt-fill me-2"></i>
                                    {property.address}, {property.cityName}
                                </p>
                                <hr />
                                <h4 className="mb-3">Description</h4>
                                <p>{property.description}</p>

                                {/* Property Specific Details */}
                                <h4 className="mb-3 mt-4">Property Details</h4>
                                <div className="row g-4">
                                    {property.residentialDetails && (
                                        <>
                                            <div className="col-md-4">
                                                <div className="d-flex align-items-center">
                                                    <i className="bi bi-house-door fs-4 me-2"></i>
                                                    <div>
                                                        <small className="text-muted d-block">BHK</small>
                                                        <span>{property.residentialDetails.bhk}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="d-flex align-items-center">
                                                    <i className="bi bi-droplet fs-4 me-2"></i>
                                                    <div>
                                                        <small className="text-muted d-block">Bathrooms</small>
                                                        <span>{property.residentialDetails.bathrooms}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="d-flex align-items-center">
                                                    <i className="bi bi-car-front fs-4 me-2"></i>
                                                    <div>
                                                        <small className="text-muted d-block">Parking</small>
                                                        <span>{property.residentialDetails.parkingAvailable ? "Available" : "Not Available"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {property.commercialDetails && (
                                        <div className="col-md-4">
                                            <div className="d-flex align-items-center">
                                                <i className="bi bi-building fs-4 me-2"></i>
                                                <div>
                                                    <small className="text-muted d-block">Carpet Area</small>
                                                    <span>{property.commercialDetails.carpetArea} sq ft</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {property.landDetails && (
                                        <>
                                            <div className="col-md-4">
                                                <div className="d-flex align-items-center">
                                                    <i className="bi bi-rulers fs-4 me-2"></i>
                                                    <div>
                                                        <small className="text-muted d-block">Plot Area</small>
                                                        <span>{property.landDetails.plotArea} sq ft</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="d-flex align-items-center">
                                                    <i className="bi bi-signpost fs-4 me-2"></i>
                                                    <div>
                                                        <small className="text-muted d-block">Road Access</small>
                                                        <span>{property.landDetails.roadAccess ? "Yes" : "No"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="col-lg-4">
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <h4 className="mb-4">Contact Information</h4>
                                <div className="d-flex align-items-center mb-3">
                                    <i className="bi bi-person-circle fs-4 me-3"></i>
                                    <div>
                                        <small className="text-muted d-block">Owner</small>
                                        <span className="fw-medium">{property.userName}</span>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center mb-3">
                                    <i className="bi bi-telephone fs-4 me-3"></i>
                                    <div>
                                        <small className="text-muted d-block">Phone</small>
                                        <span className="fw-medium">{property.ownerContactNo}</span>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center">
                                    <i className="bi bi-envelope fs-4 me-3"></i>
                                    <div>
                                        <small className="text-muted d-block">Email</small>
                                        <span className="fw-medium">{property.ownerContactEmail}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PropertyDetails;