import { Probot, ApplicationFunctionOptions } from "probot";
import * as express from "express";

export = (app: Probot, { getRouter }: ApplicationFunctionOptions) => {
    
    /// Observe issues open 
    app.on("issues.opened", async (context) => {
        const comment = context.issue({
            body: "Thanks for opening this issue! I will check it out later.",
        });
      
        context.log.info("Receive issues opened event");
        await context.octokit.issues.createComment(comment);
    });

    /// Auto create a comment when a new PR opened
    app.on("pull_request.opened", async (context) => {
        const number = context.payload.number
        const owner = context.payload.repository.owner.login
        const repo = context.payload.repository.name

        context.log.info("Receive pull request opened event");
        await context.octokit.issues.createComment({
            body: "Thanks for creating this PR!",
            issue_number: number,
            owner,
            repo
        })
    });

    /// Auto delete branch after PR being merged
    app.on("pull_request.closed", async (context) => {
        const owner = context.payload.repository.owner.login
        const repo = context.payload.repository.name
        const branch = context.payload.pull_request.head.ref
        const ref = `heads/${branch}`

        const merged = context.payload.pull_request.merged
        context.log.info("Receive pull request closed event");

        if (merged 
            /// Protected branch name
            && branch != "main" 
            && branch != "master" 
            && !branch.startsWith("release")) {
            try {
                await context.octokit.git.deleteRef({ owner, repo, ref })
                context.log.info(`Merged PR's branch ${owner}/${repo}/${ref} deleted successfully`)
            } catch (err: any) { 
                context.log.warn(err, `Merged PR's branch ${owner}/${repo}/${ref} deleted failed`)
            }
        } else {
            context.log.info(`Keeping branch ${owner}/${repo}/${ref} after PR closed`)
        }
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
};
