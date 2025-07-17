using Microsoft.IdentityModel.Tokens;
using System.Globalization;

namespace PropertiesApi.Models
{
    //public class PropertyModel
    //{
    //    public int PropertyId { get; set; }
    //    public string Description { get; set; }
    //    public int PropertyTypeId { get; set; }
    //    public int SubTypeId { get; set; }
    //    public int CityId { get; set; }
    //    public string Address { get; set; }
    //    public decimal Price { get; set; }
    //    public string Purpose { get; set; }
    //    public DateTime CreatedDate { get; set; }
    //    public string OwnerContactNo { get; set; }
    //    public string OwnerContactEmail { get; set; }
    //    public string PropertyTypeName { get; set; }
    //    public string SubTypeName { get; set; }
    //    public string CityName { get; set; }

    //    public string ImageUrls { get; set; }

    //    public List<string> ImageUrlList
    //    {
    //        get => string.IsNullOrEmpty(ImageUrls)
    //            ? new List<string>()
    //            : ImageUrls.Split(',').ToList();
    //        set => ImageUrls = value == null ? null : string.Join(",", value);
    //    }
    //    public ResidentialDetailsModel ResidentialDetails { get; set; }
    //    public RentalDetailsModel RentalDetails { get; set; }
    //    public CommercialDetailsModel CommercialDetails { get; set; }
    //    public LandDetailsModel LandDetails { get; set; }
    //}


    public class PropertyModel
    {
        
        public int PropertyId { get; set; }
        public int UserId { get; set; }

        public string? UserName { get; set; }
        public string Description { get; set; }
        public int PropertyTypeId { get; set; }
        public int SubTypeId { get; set; }
        public int CityId { get; set; }
        public string Address { get; set; }
        public decimal Price { get; set; }
        public string Purpose { get; set; }
        public DateTime CreatedDate { get; set; }
        public string OwnerContactNo { get; set; }
        public string OwnerContactEmail { get; set; }
        public string PropertyTypeName { get; set; }
        public string SubTypeName { get; set; }
        public string CityName { get; set; }

        public string? ImageUrls { get; set; } // Store image URLs as a comma-separated string

        public List<string> ImageUrlList
        {
            get => string.IsNullOrEmpty(ImageUrls)
                ? new List<string>()
                : ImageUrls.Split(',').ToList();
            set => ImageUrls = value == null ? null : string.Join(",", value);
        }

        public ResidentialDetailsModel? ResidentialDetails { get; set; }
        public RentalDetailsModel? RentalDetails { get; set; }
        public CommercialDetailsModel? CommercialDetails { get; set; }
        public LandDetailsModel? LandDetails { get; set; }
    }

    public class ResidentialDetailsModel
    {
        public int? BHK { get; set; }
        public int? Bathrooms { get; set; }
        public int? Balconies { get; set; }
        public string FurnishingStatus { get; set; }
        public bool ParkingAvailable { get; set; }
    }

    public class RentalDetailsModel
    {
        public int? TotalBeds { get; set; }
        public string Services { get; set; }
    }

    public class CommercialDetailsModel
    {
        public decimal? CarpetArea { get; set; }
    }

    public class LandDetailsModel
    {
        public decimal? PlotArea { get; set; }
        public string ZoningType { get; set; }
        public bool RoadAccess { get; set; }
    }

    public class PropertyInsertModel
    {
        public string Description { get; set; }
        public int PropertyTypeId { get; set; }
        public int SubTypeId { get; set; }
        public int CityId { get; set; }
        public string Address { get; set; }
        public decimal Price { get; set; }
        public string Purpose { get; set; }
        public string OwnerContactNo { get; set; }
        public string OwnerContactEmail { get; set; }
        public ResidentialDetailsModel ResidentialDetails { get; set; }
        public RentalDetailsModel RentalDetails { get; set; }
        public CommercialDetailsModel CommercialDetails { get; set; }
        public LandDetailsModel LandDetails { get; set; }
    }
}
    

