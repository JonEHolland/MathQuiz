using System.Web.Mvc;

namespace MathQuiz.Controllers
{
    public class DefaultController : Controller
    {      
        public ActionResult Index()
        {
            return View();
        }
    }
}
