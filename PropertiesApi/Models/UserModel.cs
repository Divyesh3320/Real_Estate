namespace PropertiesApi.Models
{
    public class UserModel
    {
        public int UserId { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string? ContactNo { get; set; }
        public bool Admin { get; set; }
        public DateTime CreatedDate { get; set; }
    }

    public class UserUpdateModel
    {
        public int UserId { get; set; }

        

        public string UserName { get; set; }
        public string Email { get; set; }
        public string? ContactNo { get; set; }
        public bool Admin { get; set; }
    }
}
