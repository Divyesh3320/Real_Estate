namespace PropertiesApi.Models
{
    public class LikeModel
    {
        public int LikeID { get; set; }
        public int UserID { get; set; }
        public int PropertyID { get; set; }
        public DateTime LikedAt { get; set; }
    }
}
