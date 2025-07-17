using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PropertiesApi.Models;
using PropertiesApi.Data;
using Microsoft.AspNetCore.Authorization;

namespace PropertiesApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
 
    public class PropertiesApiController : ControllerBase
    {
        private readonly PropertyRepository _propertyRepository;


        public PropertiesApiController(PropertyRepository propertyRepository)
        {
            _propertyRepository = propertyRepository;
        }

     


        [HttpGet("GetAllProperties")]
        public IActionResult GetAllProperties()
        {
            var properties = _propertyRepository.GetAllProperties();
            return Ok(properties);
        }

        [HttpPost("AddProperty")]
        public IActionResult AddProperty([FromBody] PropertyModel property)
        {
            if (property == null)
                return BadRequest(new { success = "success from backend", message = "Invalid Property" });

            bool isAdded = _propertyRepository.InsertProperty(property);

            if (isAdded)
                return Ok(new { success = "not success from backend", message = "Property added successfully" });

            return StatusCode(500, "An error occurred while adding the property.");
        }

        [HttpPut("UpdateProperty")]
        public IActionResult UpdateProperty([FromBody] PropertyModel property)
        {
            if (property == null || property.PropertyId <= 0)
                return BadRequest("Invalid property details.");

            bool isUpdated = _propertyRepository.UpdateProperty(property);

            if (isUpdated)
                return Ok("Property updated successfully.");

            return StatusCode(500, "An error occurred while updating the property.");
        }

        [HttpDelete("DeleteProperty/{propertyId}")]
        public IActionResult DeleteProperty(int propertyId)
        {
            if (propertyId <= 0)
                return BadRequest("Invalid property ID.");

            bool isDeleted = _propertyRepository.DeleteProperty(propertyId);

            if (isDeleted)
                return Ok("Property deleted successfully.");

            return StatusCode(500, "An error occurred while deleting the property.");
        }

        [HttpGet("GetPropertiesByUser/{userId}")]
        public IActionResult GetPropertiesByUser(int userId)
        {
            if (userId <= 0)
                return BadRequest("Invalid user ID.");

            try
            {
                var properties = _propertyRepository.GetPropertiesByUserId(userId);
                return Ok(properties);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while retrieving properties: {ex.Message}");
            }
        }

        [HttpGet("GetLikedProperties/{userId}")]
        public IActionResult GetLikedProperties(int userId)
        {
            if (userId <= 0)
                return BadRequest("Invalid user ID.");

            try
            {
                var properties = _propertyRepository.GetPropertiesLikedByUser(userId);
                return Ok(properties);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while retrieving liked properties: {ex.Message}");
            }
        }

        [HttpGet("GetPropertyById/{propertyId}")]
        public IActionResult GetPropertyById(int propertyId)
        {
            if (propertyId <= 0)
                return BadRequest("Invalid property ID.");

            try
            {
                var property = _propertyRepository.GetPropertyById(propertyId);
                
                if (property == null)
                    return NotFound($"Property with ID {propertyId} not found.");
                    
                return Ok(property);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while retrieving the property: {ex.Message}");
            }
        }
    }
}
