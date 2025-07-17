using Microsoft.Data.SqlClient;
using System.Data;
using PropertiesApi.Models;

namespace PropertiesApi.Data
{
    public class PropertyRepository
    {
        private readonly IConfiguration _configuration;

        public PropertyRepository(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        private string GetConnectionString()
        {
            return _configuration.GetConnectionString("ConnectionString");
        }

    


        public List<PropertyModel> GetAllProperties()
        {
            string connectionString = GetConnectionString();
            List<PropertyModel> properties = new List<PropertyModel>();

            using (SqlConnection sqlConnection = new SqlConnection(connectionString))
            {
                sqlConnection.Open();
                using (SqlCommand command = sqlConnection.CreateCommand())
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.CommandText = "sp_properties_selectall_withfulldetails";

                    using (SqlDataReader reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            var propertyTypeId = reader.GetInt32(reader.GetOrdinal("property_type_id"));

                            PropertyModel property = new PropertyModel
                            {
                                PropertyId = reader.GetInt32(reader.GetOrdinal("property_id")),
                                UserId = reader.GetInt32(reader.GetOrdinal("UserId")),
                                Description = reader.GetString(reader.GetOrdinal("description")),
                                PropertyTypeId = propertyTypeId,
                                ImageUrls = reader.IsDBNull(reader.GetOrdinal("ImageUrls"))
                                   ? string.Empty
                                    : reader.GetString(reader.GetOrdinal("ImageUrls")),
                                SubTypeId = reader.GetInt32(reader.GetOrdinal("sub_type_id")),
                                CityId = reader.GetInt32(reader.GetOrdinal("city_id")),
                                Address = reader.GetString(reader.GetOrdinal("address")),
                                Price = reader.GetDecimal(reader.GetOrdinal("price")),
                                Purpose = reader.GetString(reader.GetOrdinal("purpose")),
                                CreatedDate = reader.GetDateTime(reader.GetOrdinal("created_date")),
                                OwnerContactNo = reader.GetString(reader.GetOrdinal("owner_contact_no")),
                                OwnerContactEmail = reader.GetString(reader.GetOrdinal("owner_contact_email")),
                                PropertyTypeName = reader.GetString(reader.GetOrdinal("property_type_name")),
                                SubTypeName = reader.GetString(reader.GetOrdinal("sub_type_name")),
                                CityName = reader.GetString(reader.GetOrdinal("city_name"))
                            };

                            // Include related details based on property type
                            switch (propertyTypeId)
                            {
                                case 1: // Residential
                                    property.ResidentialDetails = new ResidentialDetailsModel
                                    {
                                        BHK = reader.IsDBNull(reader.GetOrdinal("bhk")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("bhk")),
                                        Bathrooms = reader.IsDBNull(reader.GetOrdinal("bathrooms")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("bathrooms")),
                                        Balconies = reader.IsDBNull(reader.GetOrdinal("balconies")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("balconies")),
                                        FurnishingStatus = reader.IsDBNull(reader.GetOrdinal("furnishing_status")) ? null : reader.GetString(reader.GetOrdinal("furnishing_status")),
                                        ParkingAvailable = reader.IsDBNull(reader.GetOrdinal("parking_available")) ? false : reader.GetBoolean(reader.GetOrdinal("parking_available"))
                                    };
                                    break;

                                case 2: // CommercialDetailsModel


                                    property.CommercialDetails = new CommercialDetailsModel
                                    {
                                        CarpetArea = reader.IsDBNull(reader.GetOrdinal("carpet_area")) ? (decimal?)null : reader.GetDecimal(reader.GetOrdinal("carpet_area"))
                                    };
                                    break;
                                    

                                case 3: // LandDetailsModel
                                    property.LandDetails = new LandDetailsModel
                                    {
                                        PlotArea = reader.IsDBNull(reader.GetOrdinal("plot_area")) ? (decimal?)null : reader.GetDecimal(reader.GetOrdinal("plot_area")),
                                        ZoningType = reader.IsDBNull(reader.GetOrdinal("zoning_type")) ? null : reader.GetString(reader.GetOrdinal("zoning_type")),
                                        RoadAccess = reader.IsDBNull(reader.GetOrdinal("road_access")) ? false : reader.GetBoolean(reader.GetOrdinal("road_access"))
                                    };
                                    break;

                                case 4: // RentalDetailsModel
                                    property.RentalDetails = new RentalDetailsModel
                                    {
                                        TotalBeds = reader.IsDBNull(reader.GetOrdinal("total_beds")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("total_beds")),
                                        Services = reader.IsDBNull(reader.GetOrdinal("services")) ? null : reader.GetString(reader.GetOrdinal("services"))
                                    };
                                   
                                    break;

                                default:
                                    // No additional details for unknown types
                                    break;
                            }

                            properties.Add(property);
                        }
                    }
                }
            }

            return properties;
        }


        public bool InsertProperty(PropertyModel property)
        {
            string connectionString = GetConnectionString();
            int rowsAffected;

            using (SqlConnection sqlConnection = new SqlConnection(connectionString))
            {
                sqlConnection.Open();
                using (SqlCommand command = sqlConnection.CreateCommand())
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.CommandText = "sp_insert_property"; // You need to create this stored procedure.

                    // Add parameters for the property table
                    command.Parameters.AddWithValue("@Description", property.Description);
                    command.Parameters.AddWithValue("@ImageUrls", property.ImageUrls);
                    command.Parameters.AddWithValue("@PropertyTypeId", property.PropertyTypeId);
                    command.Parameters.AddWithValue("@SubTypeId", property.SubTypeId);
                    command.Parameters.AddWithValue("@CityId", property.CityId);
                    command.Parameters.AddWithValue("@UserId", property.UserId);
                    command.Parameters.AddWithValue("@Address", property.Address);
                    command.Parameters.AddWithValue("@Price", property.Price);
                    command.Parameters.AddWithValue("@Purpose", property.Purpose);
                    command.Parameters.AddWithValue("@OwnerContactNo", property.OwnerContactNo);
                    command.Parameters.AddWithValue("@OwnerContactEmail", property.OwnerContactEmail);

                    // Add additional parameters for related tables based on property type
                    if (property.ResidentialDetails != null)
                    {
                        command.Parameters.AddWithValue("@BHK", property.ResidentialDetails.BHK ?? (object)DBNull.Value);
                        command.Parameters.AddWithValue("@Bathrooms", property.ResidentialDetails.Bathrooms ?? (object)DBNull.Value);
                        command.Parameters.AddWithValue("@Balconies", property.ResidentialDetails.Balconies ?? (object)DBNull.Value);
                        command.Parameters.AddWithValue("@FurnishingStatus", property.ResidentialDetails.FurnishingStatus ?? (object)DBNull.Value);
                        command.Parameters.AddWithValue("@ParkingAvailable", property.ResidentialDetails.ParkingAvailable);
                    }

                    if (property.RentalDetails != null)
                    {
                        command.Parameters.AddWithValue("@TotalBeds", property.RentalDetails.TotalBeds ?? (object)DBNull.Value);
                        command.Parameters.AddWithValue("@Services", property.RentalDetails.Services ?? (object)DBNull.Value);
                    }

                    if (property.CommercialDetails != null)
                    {
                        command.Parameters.AddWithValue("@CarpetArea", property.CommercialDetails.CarpetArea ?? (object)DBNull.Value);
                    }

                    if (property.LandDetails != null)
                    {
                        command.Parameters.AddWithValue("@PlotArea", property.LandDetails.PlotArea ?? (object)DBNull.Value);
                        command.Parameters.AddWithValue("@ZoningType", property.LandDetails.ZoningType ?? (object)DBNull.Value);
                        command.Parameters.AddWithValue("@RoadAccess", property.LandDetails.RoadAccess);
                    }

                    try
                    {
                        // Existing logic...
                        rowsAffected = command.ExecuteNonQuery();
                        return rowsAffected > 0;
                    }
                    catch (SqlException ex)
                    {
                        Console.WriteLine($"SQL Error: {ex.Message}");
                        throw; // Re-throw for further handling
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"General Error: {ex.Message}");
                        throw;
                    }
                }
            }

            
        }

        public bool UpdateProperty(PropertyModel property)
        {
            string connectionString = GetConnectionString();
            int rowsAffected;

            using (SqlConnection sqlConnection = new SqlConnection(connectionString))
            {
                sqlConnection.Open();
                using (SqlCommand command = sqlConnection.CreateCommand())
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.CommandText = "sp_update_property"; // You need to create this stored procedure.

                    // Add parameters for the property table
                    command.Parameters.AddWithValue("@ImageUrls", property.ImageUrls);
                    command.Parameters.AddWithValue("@PropertyId", property.PropertyId);
                    command.Parameters.AddWithValue("@Description", property.Description);
                    command.Parameters.AddWithValue("@PropertyTypeId", property.PropertyTypeId);
                    command.Parameters.AddWithValue("@SubTypeId", property.SubTypeId);
                    command.Parameters.AddWithValue("@CityId", property.CityId);
                    command.Parameters.AddWithValue("@Address", property.Address);
                    command.Parameters.AddWithValue("@Price", property.Price);
                    command.Parameters.AddWithValue("@Purpose", property.Purpose);
                    command.Parameters.AddWithValue("@OwnerContactNo", property.OwnerContactNo);
                    command.Parameters.AddWithValue("@OwnerContactEmail", property.OwnerContactEmail);

                    // Add additional parameters for related tables based on property type
                    if (property.ResidentialDetails != null)
                    {
                        command.Parameters.AddWithValue("@BHK", property.ResidentialDetails.BHK ?? (object)DBNull.Value);
                        command.Parameters.AddWithValue("@Bathrooms", property.ResidentialDetails.Bathrooms ?? (object)DBNull.Value);
                        command.Parameters.AddWithValue("@Balconies", property.ResidentialDetails.Balconies ?? (object)DBNull.Value);
                        command.Parameters.AddWithValue("@FurnishingStatus", property.ResidentialDetails.FurnishingStatus ?? (object)DBNull.Value);
                        command.Parameters.AddWithValue("@ParkingAvailable", property.ResidentialDetails.ParkingAvailable);
                    }

                    if (property.RentalDetails != null)
                    {
                        command.Parameters.AddWithValue("@TotalBeds", property.RentalDetails.TotalBeds ?? (object)DBNull.Value);
                        command.Parameters.AddWithValue("@Services", property.RentalDetails.Services ?? (object)DBNull.Value);
                    }

                    if (property.CommercialDetails != null)
                    {
                        command.Parameters.AddWithValue("@CarpetArea", property.CommercialDetails.CarpetArea ?? (object)DBNull.Value);
                    }

                    if (property.LandDetails != null)
                    {
                        command.Parameters.AddWithValue("@PlotArea", property.LandDetails.PlotArea ?? (object)DBNull.Value);
                        command.Parameters.AddWithValue("@ZoningType", property.LandDetails.ZoningType ?? (object)DBNull.Value);
                        command.Parameters.AddWithValue("@RoadAccess", property.LandDetails.RoadAccess);
                    }

                    rowsAffected = command.ExecuteNonQuery();
                }
            }

            return rowsAffected > 0;
        }


        public bool DeleteProperty(int propertyId)
        {
            string connectionString = GetConnectionString();
            int rowsAffected;

            using (SqlConnection sqlConnection = new SqlConnection(connectionString))
            {
                sqlConnection.Open();
                using (SqlCommand command = sqlConnection.CreateCommand())
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.CommandText = "sp_delete_property"; // You need to create this stored procedure.

                    command.Parameters.AddWithValue("@property_id", propertyId);

                    rowsAffected = command.ExecuteNonQuery();
                }
            }

            return rowsAffected > 0;
        }

        public List<PropertyModel> GetPropertiesByUserId(int userId)
        {
            string connectionString = GetConnectionString();
            List<PropertyModel> properties = new List<PropertyModel>();

            using (SqlConnection sqlConnection = new SqlConnection(connectionString))
            {
                sqlConnection.Open();
                using (SqlCommand command = sqlConnection.CreateCommand())
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.CommandText = "sp_properties_selectby_userid"; // You'll need to create this stored procedure
                    command.Parameters.AddWithValue("@UserId", userId);

                    using (SqlDataReader reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            var propertyTypeId = reader.GetInt32(reader.GetOrdinal("property_type_id"));

                            PropertyModel property = new PropertyModel
                            {
                                PropertyId = reader.GetInt32(reader.GetOrdinal("property_id")),
                                UserId = reader.GetInt32(reader.GetOrdinal("UserId")),
                                Description = reader.GetString(reader.GetOrdinal("description")),
                                PropertyTypeId = propertyTypeId,
                                ImageUrls = reader.IsDBNull(reader.GetOrdinal("ImageUrls"))
                                    ? string.Empty
                                    : reader.GetString(reader.GetOrdinal("ImageUrls")),
                                SubTypeId = reader.GetInt32(reader.GetOrdinal("sub_type_id")),
                                CityId = reader.GetInt32(reader.GetOrdinal("city_id")),
                                Address = reader.GetString(reader.GetOrdinal("address")),
                                Price = reader.GetDecimal(reader.GetOrdinal("price")),
                                Purpose = reader.GetString(reader.GetOrdinal("purpose")),
                                CreatedDate = reader.GetDateTime(reader.GetOrdinal("created_date")),
                                OwnerContactNo = reader.GetString(reader.GetOrdinal("owner_contact_no")),
                                OwnerContactEmail = reader.GetString(reader.GetOrdinal("owner_contact_email")),
                                PropertyTypeName = reader.GetString(reader.GetOrdinal("property_type_name")),
                                SubTypeName = reader.GetString(reader.GetOrdinal("sub_type_name")),
                                CityName = reader.GetString(reader.GetOrdinal("city_name"))
                            };

                            // Include related details based on property type
                            switch (propertyTypeId)
                            {
                                case 1: // Residential
                                    property.ResidentialDetails = new ResidentialDetailsModel
                                    {
                                        BHK = reader.IsDBNull(reader.GetOrdinal("bhk")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("bhk")),
                                        Bathrooms = reader.IsDBNull(reader.GetOrdinal("bathrooms")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("bathrooms")),
                                        Balconies = reader.IsDBNull(reader.GetOrdinal("balconies")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("balconies")),
                                        FurnishingStatus = reader.IsDBNull(reader.GetOrdinal("furnishing_status")) ? null : reader.GetString(reader.GetOrdinal("furnishing_status")),
                                        ParkingAvailable = reader.IsDBNull(reader.GetOrdinal("parking_available")) ? false : reader.GetBoolean(reader.GetOrdinal("parking_available"))
                                    };
                                    break;

                                case 2: // CommercialDetailsModel


                                    property.CommercialDetails = new CommercialDetailsModel
                                    {
                                        CarpetArea = reader.IsDBNull(reader.GetOrdinal("carpet_area")) ? (decimal?)null : reader.GetDecimal(reader.GetOrdinal("carpet_area"))
                                    };
                                    break;
                                    

                                case 3: // LandDetailsModel
                                    property.LandDetails = new LandDetailsModel
                                    {
                                        PlotArea = reader.IsDBNull(reader.GetOrdinal("plot_area")) ? (decimal?)null : reader.GetDecimal(reader.GetOrdinal("plot_area")),
                                        ZoningType = reader.IsDBNull(reader.GetOrdinal("zoning_type")) ? null : reader.GetString(reader.GetOrdinal("zoning_type")),
                                        RoadAccess = reader.IsDBNull(reader.GetOrdinal("road_access")) ? false : reader.GetBoolean(reader.GetOrdinal("road_access"))
                                    };
                                    break;

                                case 4: // RentalDetailsModel
                                    property.RentalDetails = new RentalDetailsModel
                                    {
                                        TotalBeds = reader.IsDBNull(reader.GetOrdinal("total_beds")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("total_beds")),
                                        Services = reader.IsDBNull(reader.GetOrdinal("services")) ? null : reader.GetString(reader.GetOrdinal("services"))
                                    };
                                   
                                    break;

                                default:
                                    // No additional details for unknown types
                                    break;
                            }

                            properties.Add(property);
                        }
                    }
                }
            }

            return properties;
        }

        public List<PropertyModel> GetPropertiesLikedByUser(int userId)
        {
            string connectionString = GetConnectionString();
            List<PropertyModel> properties = new List<PropertyModel>();

            using (SqlConnection sqlConnection = new SqlConnection(connectionString))
            {
                sqlConnection.Open();
                using (SqlCommand command = sqlConnection.CreateCommand())
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.CommandText = "sp_get_user_liked_properties";
                    command.Parameters.AddWithValue("@UserID", userId);

                    using (SqlDataReader reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            var propertyTypeId = reader.GetInt32(reader.GetOrdinal("property_type_id"));

                            PropertyModel property = new PropertyModel
                            {
                                PropertyId = reader.GetInt32(reader.GetOrdinal("property_id")),
                                UserId = reader.GetInt32(reader.GetOrdinal("UserID")),
                                Description = reader.GetString(reader.GetOrdinal("description")),
                                PropertyTypeId = propertyTypeId,
                                ImageUrls = reader.IsDBNull(reader.GetOrdinal("ImageUrls"))
                                    ? string.Empty
                                    : reader.GetString(reader.GetOrdinal("ImageUrls")),
                                SubTypeId = reader.GetInt32(reader.GetOrdinal("sub_type_id")),
                                CityId = reader.GetInt32(reader.GetOrdinal("city_id")),
                                Address = reader.GetString(reader.GetOrdinal("address")),
                                Price = reader.GetDecimal(reader.GetOrdinal("price")),
                                Purpose = reader.GetString(reader.GetOrdinal("purpose")),
                                CreatedDate = reader.GetDateTime(reader.GetOrdinal("created_date")),
                                OwnerContactNo = reader.GetString(reader.GetOrdinal("owner_contact_no")),
                                OwnerContactEmail = reader.GetString(reader.GetOrdinal("owner_contact_email")),
                                PropertyTypeName = reader.GetString(reader.GetOrdinal("property_type_name")),
                                SubTypeName = reader.GetString(reader.GetOrdinal("sub_type_name")),
                                CityName = reader.GetString(reader.GetOrdinal("city_name"))
                            };

                            // Include related details based on property type
                            switch (propertyTypeId)
                            {
                                case 1: // Residential
                                    property.ResidentialDetails = new ResidentialDetailsModel
                                    {
                                        BHK = reader.IsDBNull(reader.GetOrdinal("bhk")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("bhk")),
                                        Bathrooms = reader.IsDBNull(reader.GetOrdinal("bathrooms")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("bathrooms")),
                                        Balconies = reader.IsDBNull(reader.GetOrdinal("balconies")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("balconies")),
                                        FurnishingStatus = reader.IsDBNull(reader.GetOrdinal("furnishing_status")) ? null : reader.GetString(reader.GetOrdinal("furnishing_status")),
                                        ParkingAvailable = reader.IsDBNull(reader.GetOrdinal("parking_available")) ? false : reader.GetBoolean(reader.GetOrdinal("parking_available"))
                                    };
                                    break;

                                case 2: // CommercialDetailsModel


                                    property.CommercialDetails = new CommercialDetailsModel
                                    {
                                        CarpetArea = reader.IsDBNull(reader.GetOrdinal("carpet_area")) ? (decimal?)null : reader.GetDecimal(reader.GetOrdinal("carpet_area"))
                                    };
                                    break;
                                    

                                case 3: // LandDetailsModel
                                    property.LandDetails = new LandDetailsModel
                                    {
                                        PlotArea = reader.IsDBNull(reader.GetOrdinal("plot_area")) ? (decimal?)null : reader.GetDecimal(reader.GetOrdinal("plot_area")),
                                        ZoningType = reader.IsDBNull(reader.GetOrdinal("zoning_type")) ? null : reader.GetString(reader.GetOrdinal("zoning_type")),
                                        RoadAccess = reader.IsDBNull(reader.GetOrdinal("road_access")) ? false : reader.GetBoolean(reader.GetOrdinal("road_access"))
                                    };
                                    break;

                                case 4: // RentalDetailsModel
                                    property.RentalDetails = new RentalDetailsModel
                                    {
                                        TotalBeds = reader.IsDBNull(reader.GetOrdinal("total_beds")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("total_beds")),
                                        Services = reader.IsDBNull(reader.GetOrdinal("services")) ? null : reader.GetString(reader.GetOrdinal("services"))
                                    };
                                   
                                    break;

                                default:
                                    // No additional details for unknown types
                                    break;
                            }

                            properties.Add(property);
                        }
                    }
                }
            }

            return properties;
        }

        public PropertyModel GetPropertyById(int propertyId)
        {
            string connectionString = GetConnectionString();
            PropertyModel property = null;

            using (SqlConnection sqlConnection = new SqlConnection(connectionString))
            {
                sqlConnection.Open();
                using (SqlCommand command = sqlConnection.CreateCommand())
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.CommandText = "sp_get_property_by_id";
                    command.Parameters.AddWithValue("@PropertyId", propertyId);

                    using (SqlDataReader reader = command.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            var propertyTypeId = reader.GetInt32(reader.GetOrdinal("property_type_id"));

                            property = new PropertyModel
                            {
                                PropertyId = reader.GetInt32(reader.GetOrdinal("property_id")),
                                UserId = reader.GetInt32(reader.GetOrdinal("UserId")),
                                Description = reader.GetString(reader.GetOrdinal("description")),
                                UserName = reader.GetString(reader.GetOrdinal("UserName")),
                                PropertyTypeId = propertyTypeId,
                                ImageUrls = reader.IsDBNull(reader.GetOrdinal("ImageUrls"))
                                    ? string.Empty
                                    : reader.GetString(reader.GetOrdinal("ImageUrls")),
                                SubTypeId = reader.GetInt32(reader.GetOrdinal("sub_type_id")),
                                CityId = reader.GetInt32(reader.GetOrdinal("city_id")),
                                Address = reader.GetString(reader.GetOrdinal("address")),
                                Price = reader.GetDecimal(reader.GetOrdinal("price")),
                                Purpose = reader.GetString(reader.GetOrdinal("purpose")),
                                CreatedDate = reader.GetDateTime(reader.GetOrdinal("created_date")),
                                OwnerContactNo = reader.GetString(reader.GetOrdinal("owner_contact_no")),
                                OwnerContactEmail = reader.GetString(reader.GetOrdinal("owner_contact_email")),
                                PropertyTypeName = reader.GetString(reader.GetOrdinal("property_type_name")),
                                SubTypeName = reader.GetString(reader.GetOrdinal("sub_type_name")),
                                CityName = reader.GetString(reader.GetOrdinal("city_name"))
                            };

                            // Include related details based on property type
                            switch (propertyTypeId)
                            {
                                case 1: // Residential
                                    property.ResidentialDetails = new ResidentialDetailsModel
                                    {
                                        BHK = reader.IsDBNull(reader.GetOrdinal("bhk")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("bhk")),
                                        Bathrooms = reader.IsDBNull(reader.GetOrdinal("bathrooms")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("bathrooms")),
                                        Balconies = reader.IsDBNull(reader.GetOrdinal("balconies")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("balconies")),
                                        FurnishingStatus = reader.IsDBNull(reader.GetOrdinal("furnishing_status")) ? null : reader.GetString(reader.GetOrdinal("furnishing_status")),
                                        ParkingAvailable = reader.IsDBNull(reader.GetOrdinal("parking_available")) ? false : reader.GetBoolean(reader.GetOrdinal("parking_available"))
                                    };
                                    break;

                                case 2: // Commercial
                                    property.CommercialDetails = new CommercialDetailsModel
                                    {
                                        CarpetArea = reader.IsDBNull(reader.GetOrdinal("carpet_area")) ? (decimal?)null : reader.GetDecimal(reader.GetOrdinal("carpet_area"))
                                    };
                                    break;

                                    case 3: // Land
                                        property.LandDetails = new LandDetailsModel
                                        {
                                            PlotArea = reader.IsDBNull(reader.GetOrdinal("plot_area")) ? (decimal?)null : reader.GetDecimal(reader.GetOrdinal("plot_area")),
                                            ZoningType = reader.IsDBNull(reader.GetOrdinal("zoning_type")) ? null : reader.GetString(reader.GetOrdinal("zoning_type")),
                                            RoadAccess = reader.IsDBNull(reader.GetOrdinal("road_access")) ? false : reader.GetBoolean(reader.GetOrdinal("road_access"))
                                        };
                                        break;

                                    case 4: // Rental
                                        property.RentalDetails = new RentalDetailsModel
                                        {
                                            TotalBeds = reader.IsDBNull(reader.GetOrdinal("total_beds")) ? (int?)null : reader.GetInt32(reader.GetOrdinal("total_beds")),
                                            Services = reader.IsDBNull(reader.GetOrdinal("services")) ? null : reader.GetString(reader.GetOrdinal("services"))
                                        };
                                        break;
                            }
                        }
                    }
                }
            }

            return property;
        }

    }
}