import React from "react"
import { StaticQuery, graphql } from "gatsby"
import YearIndex from "../templates/year_index"

const BlogIndex = () => (
  <StaticQuery
    query={graphql`
      {
        allMdx(filter: { frontmatter: { category: { in: "blog" } } }) {
          edges {
            node {
              frontmatter {
                title
                tags
                slug
                createdMs
                archive
                draft
              }
            }
          }
        }
      }
    `}
    render={data => <YearIndex data={data} />}
  />
)

export default BlogIndex
