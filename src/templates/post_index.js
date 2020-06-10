import React from "react"
import { graphql, Link } from "gatsby"
/** @jsx jsx */
import { jsx, Styled, Box } from "theme-ui"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArchive, faEdit } from "@fortawesome/free-solid-svg-icons"

import Layout from "../components/layout"
import Tags from "../components/tags"

const PostIndex = ({
  data: {
    allMdx: { edges },
  },
  title,
  titleLink,
}) => {
  let yearIndex = edges.reduce((acc, x) => {
    const {
      node: {
        fields: { createdMs },
      },
    } = x
    const year = new Date(createdMs).getFullYear()
    if (!acc.hasOwnProperty(year)) {
      acc[year] = []
    }
    acc[year].push(x)
    return acc
  }, {})

  const yearList = Object.keys(yearIndex)
  yearList.sort().reverse()

  yearList.forEach(year => {
    yearIndex[year].sort(function(x, y) {
      const {
        node: {
          fields: { createdMs: c1 },
        },
      } = x
      const {
        node: {
          fields: { createdMs: c2 },
        },
      } = y
      return new Date(c1) < new Date(c2) ? 1 : -1
    })
  })

  return (
    <Layout
      frontmatter={{
        title: title || "Posts",
        description: "Index of all blog posts.",
      }}
    >
      <Box
        sx={{
          p: "1em",
          m: "auto",
          minWidth: [null, null, "50rem", "50rem"],
          maxWidth: ["100%", "100%", "50rem", "50rem"],
        }}
      >
        <Styled.h2>
          <Styled.a as={Link} to={titleLink || "/blog"}>
            {title || "Posts"}
          </Styled.a>{" "}
        </Styled.h2>
        {yearList.map((year, i) => (
          <React.Fragment key={i}>
            <Styled.h3>{year}</Styled.h3>
            <Styled.ul>
              {yearIndex[year].map(
                (
                  {
                    node: {
                      frontmatter: { title, slug, archive, draft, tags },
                      fields: { createdMs },
                    },
                  },
                  j
                ) => (
                  <Styled.li key={j}>
                    <Styled.a as={Link} to={slug}>
                      {title}
                    </Styled.a>
                    {archive === true ? (
                      <FontAwesomeIcon
                        icon={faArchive}
                        title="This post is archived."
                        sx={{ ml: "0.5em", fontSize: 0 }}
                      />
                    ) : null}
                    {draft === true ? (
                      <FontAwesomeIcon
                        icon={faEdit}
                        title="This post is a working draft."
                        sx={{ ml: "0.5em", fontSize: 0 }}
                      />
                    ) : null}
                    <span sx={{ color: "secondary", m: "0 .5em", fontSize: 0 }}>
                      {new Date(createdMs).toLocaleString("default", {
                        month: "long",
                      })}{" "}
                      {new Date(createdMs).getDate()}
                    </span>
                    <br />
                    <Tags tags={tags} />
                  </Styled.li>
                )
              )}
            </Styled.ul>
          </React.Fragment>
        ))}
      </Box>
    </Layout>
  )
}

export default PostIndex

export const pageQuery = graphql`
  query($tag: [String!]) {
    allMdx(
      filter: { frontmatter: { category: { in: "blog" }, tags: { in: $tag } } }
    ) {
      edges {
        node {
          frontmatter {
            title
            tags
            slug
            archive
            draft
          }
          fields {
            createdMs
          }
        }
      }
    }
  }
`