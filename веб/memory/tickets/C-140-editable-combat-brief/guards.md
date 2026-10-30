# Guards C-140

1. `/studio/*/mesh` — User card has textarea (`user-brief-input` or `#node-user textarea`)
2. Brief persists `cf.mesh.userBrief.v1:<pipelineId>`
3. Defaults differ per pipeline (carousel ≠ reels)
4. Composer send uses `composeTopicWithBrief`

Evidence: Playwright `hasTextarea: true`, briefLen > 0.
