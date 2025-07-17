using Microsoft.AspNetCore.Mvc;
using PropertiesApi.Data;
using PropertiesApi.Models;

namespace PropertiesApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly UserRepository _userRepository;

        public UsersController(UserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        [HttpGet]
        public IActionResult GetAllUsers()
        {
            var users = _userRepository.GetAllUsers();
            return Ok(users);
        }

        [HttpGet("{id}")]
        public IActionResult GetUser(int id)
        {
            var user = _userRepository.GetUserById(id);
            if (user == null)
                return NotFound();

            return Ok(user);
        }

        [HttpPost]
        public IActionResult CreateUser([FromBody] UserModel user)
        {
            if (user == null)
                return BadRequest();

            bool result = _userRepository.InsertUser(user);
            if (result)
                return Ok(new { message = "User created successfully" });

            return StatusCode(500, "An error occurred while creating the user");
        }

        [HttpPut("{userId}")]
        public IActionResult UpdateUser([FromBody] UserUpdateModel user)
        {
            if (user == null)
                return BadRequest();

            bool result = _userRepository.UpdateUser(user);
            if (result)
                return Ok(new { message = "User updated successfully" });

            return StatusCode(500, "An error occurred while updating the user");
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteUser(int id)
        {
            bool result = _userRepository.DeleteUser(id);
            if (result)
                return Ok(new { message = "User deleted successfully" });

            return StatusCode(500, "An error occurred while deleting the user");
        }

        public class LoginRequest
        {
            public string Email { get; set; }
            public string Password { get; set; }
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest loginRequest)
        {
            if (string.IsNullOrEmpty(loginRequest.Email) || string.IsNullOrEmpty(loginRequest.Password))
            {
                return BadRequest(new { message = "Email and password are required" });
            }

            try
            {
                var user = _userRepository.LoginUser(loginRequest.Email, loginRequest.Password);
                
                if (user != null)
                {
                    return Ok(new 
                    { 
                        user = new
                        {
                            userId = user.UserId,
                            userName = user.UserName,
                            email = user.Email,
                            contactNo = user.ContactNo,
                            isAdmin = user.Admin
                        }
                    });
                }

                return Unauthorized(new { message = "Invalid email or password" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred during login" });
            }
        }
    }
}