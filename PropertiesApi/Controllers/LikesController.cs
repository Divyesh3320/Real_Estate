using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PropertiesApi.Data;
using PropertiesApi.Models;

namespace PropertiesApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
 
    public class LikesController : ControllerBase
    {
        private readonly LikeRepository _likeRepository;

        public LikesController(LikeRepository likeRepository)
        {
            _likeRepository = likeRepository;
        }

        [HttpGet]
        public IActionResult GetAllLikes()
        {
            var likes = _likeRepository.GetAllLikes();
            return Ok(likes);
        }

        [HttpGet("user/{userId}")]
        public IActionResult GetLikesByUser(int userId)
        {
            var likes = _likeRepository.GetLikesByUser(userId);
            return Ok(likes);
        }

        [HttpGet("property/{propertyId}")]
        public IActionResult GetLikesByProperty(int propertyId)
        {
            var likes = _likeRepository.GetLikesByProperty(propertyId);
            return Ok(likes);
        }

        [HttpPost]
        public IActionResult CreateLike([FromBody] LikeModel like)
        {
            if (like == null)
                return BadRequest();

            bool result = _likeRepository.InsertLike(like);
            if (result)
                return Ok(new { message = "Like added successfully" });

            return StatusCode(409, "User has already liked this property");
        }

        [HttpDelete("{userId}/{propertyId}")]
        public IActionResult DeleteLike(int userId, int propertyId)
        {
            bool result = _likeRepository.DeleteLike(userId, propertyId);
            if (result)
                return Ok(new { message = "Like removed successfully" });

            return NotFound("Like not found");
        }
    }
}