using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using PropertiesApi.Data;
using PropertiesApi.Models;

namespace PropertiesApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : Controller
    {
        private readonly UserRepository _userRepository;
        private readonly IConfiguration _configuration;

        #region UserConstructor
        public AuthController(UserRepository userRepository, IConfiguration configuration)
        {
            _userRepository = userRepository;
            _configuration = configuration;
        }
        #endregion

        #region UserAuthentication
        [HttpPost("auth")]
        public IActionResult UserAuth([FromBody] UserLoginModel users)
        {
            try
            {
                var user = _userRepository.LoginUser(users.Email, users.Password);
                if (user == null)
                {
                    return BadRequest(new { message = "Invalid credentials" });
                }

                // Generate JWT token
                var token = GenerateJWTToken(user);

                return Ok(new
                {
                    Token = token,
                    User = new
                    {
                        userId = user.UserId,
                        userName = user.UserName,
                        email = user.Email,
                        contactNo = user.ContactNo,
                        isAdmin = user.Admin
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
            }
        }
        #endregion

        #region GenerateJWTToken
        private string GenerateJWTToken(UserModel user)
        {
            // Read JWT settings from appsettings.json
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Define claims
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            // Create token
            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(Convert.ToDouble(jwtSettings["TokenExpiryInHours"])),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        #endregion
    }

    public class UserLoginModel
    {
        public string Email { get; set; }
        public string Password { get; set; }
        public string Role { get; set; }
    }

}
