using Microsoft.AspNetCore.Mvc;
using PropertyManagement.API.DTOs.Assistant;
using PropertyManagement.API.Services;
using System.Threading.Tasks;

namespace PropertyManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AssistantController : ControllerBase
    {
        private readonly GeminiAssistantService _assistantService;

        public AssistantController(GeminiAssistantService assistantService)
        {
            _assistantService = assistantService;
        }

        [HttpPost("chat")]
        public async Task<IActionResult> Chat([FromBody] ChatRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Message))
            {
                return BadRequest("Message cannot be empty.");
            }

            var response = await _assistantService.ProcessChatAsync(request);

            // TODO: In a real implementation, you would route the intent to specific handlers here
            // For example:
            // if (response.Intent == "search") {
            //     var properties = await _propertyService.SearchProperties(response.Query);
            //     return Ok(new { response, data = properties });
            // }

            return Ok(response);
        }
    }
}
