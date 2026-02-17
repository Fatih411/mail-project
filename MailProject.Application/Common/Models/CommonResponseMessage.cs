using System.Collections.Generic;

namespace MailProject.Application.Common.Models
{
    public class CommonResponseMessage<T>
    {
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public int StatusCode { get; set; }
        public T? Data { get; set; }
        public bool IsSuccess => StatusCode >= 200 && StatusCode < 300;

        public static CommonResponseMessage<T> Success(T data, string message = "Success", int statusCode = 200)
        {
            return new CommonResponseMessage<T> { Data = data, Message = message, StatusCode = statusCode, Title = "Success" };
        }

        public static CommonResponseMessage<T> Fail(string message, int statusCode = 400, string title = "Error")
        {
            return new CommonResponseMessage<T> { Data = default, Message = message, StatusCode = statusCode, Title = title };
        }
    }

    public class PaginatedResponseMessage<T> : CommonResponseMessage<IEnumerable<T>>
    {
        public int Page { get; set; }
        public int Size { get; set; }
        public int TotalCount { get; set; }

        public static PaginatedResponseMessage<T> Success(IEnumerable<T> data, int page, int size, int totalCount, string message = "Success", int statusCode = 200)
        {
            return new PaginatedResponseMessage<T> 
            { 
                Data = data, 
                Page = page, 
                Size = size, 
                TotalCount = totalCount, 
                Message = message, 
                StatusCode = statusCode, 
                Title = "Success" 
            };
        }
    }
}
