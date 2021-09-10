import { Probot, ApplicationFunctionOptions } from "probot";
import * as express from "express";

export = (app: Probot, { getRouter } : ApplicationFunctionOptions) => {
    app.on("issues.opened", async (context) => {
        const comment = context.issue({
            body: "Thanks for opening this issue! I will check it out later.",
        });
      
        context.log.info("Receive issues opened event");
        await context.octokit.issues.createComment(comment);
    });

    /// Get an express router to expose new HTTP endpoints
    /// Use '!' to forced resolution in chained call
    const router = getRouter!("/titanfallbot");
    
    /// Use build-in middleware
    router.use(express.static("public"))
          .use(express.json({ limit: "5mb" }))  
          /// Middleware functions that appends the specified value to the HTTP response header field
          .use((_, res, next) => {
              /// Support CROS request
              res.append("Access-Control-Allow-Origin", "*")
              res.append("Access-Control-Allow-Methods", ['GET', 'PUT', 'POST', 'DELETE'])
              res.append("Access-Control-Allow-Headers", "*")
              res.append("Access-Control-Max-Age", "300")
              /// Move to next middleware
              next()
          })
        
          /// Add a new route
          .get("/:event/:action/test", async (req, res) => {
              const { event, action } = req.params
              const { user_id } = req.query

              const json = {
                  user_id: user_id, 
                  event: event, 
                  action: action, 
                  content: "hello world!"
              }

              req.log.info(`Trigger ${event} with ${action} for user: ${user_id}`)
              res.send(json)
          })   

          .get("*", async (req, res) => {
              req.log.warn("Mismatched request endpoint")
              res.status(404).render("Not Found! Please check your endpoint")
          })
};
