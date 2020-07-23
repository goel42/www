const siteMetadata = require(`./site/metadata`)
const visit = require(`unist-util-visit`)

const orgsys = require(`./site/orgsys`)

const gatsbyRemarkPlugins = [
  {
    resolve: require.resolve(`./plugins/gatsby-remark-local-links`),
  },
  {
    resolve: require.resolve(`./plugins/gatsby-remark-local-image`),
  },
  {
    resolve: require.resolve(`./plugins/gatsby-remark-local-bibtex`),
  },
  {
    resolve: require.resolve(`./plugins/gatsby-remark-local-vega`),
  },
  {
    resolve: `gatsby-remark-autolink-headers`,
    options: { icon: false },
  },
]

if (process.env.NODE_ENV === "production") {
  const prodGatsbyRemarkPlugins = [
    {
      resolve: `gatsby-remark-katex`,
      options: {
        strict: `ignore`,
      },
    },
  ]

  gatsbyRemarkPlugins.push(...prodGatsbyRemarkPlugins)
}

const getSearchText = ast => {
  let searchText = []

  visit(ast, "text", n => {
    searchText.push(n.value)
  })

  return searchText.join(" ")
}

module.exports = {
  siteMetadata,
  plugins: [
    {
      resolve: `gatsby-source-tmdb`,
      options: {
        apiKey: process.env.TMDB_API_KEY,
        sessionID: process.env.TMDB_SESSION_ID,
        modules: {
          account: {
            activate: true,
            endpoints: {
              tvs: [`accountFavoriteTv`],
              movies: [`accountFavoriteMovies`],
            },
          },
        },
        poster: false,
        backdrop: false,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/site/contents`,
        name: `contents`,
      },
    },
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        extensions: [`.mdx`, `.md`],
        gatsbyRemarkPlugins,
      },
    },
    {
      resolve: `gatsby-plugin-local-mdx`,
      options: {
        templatesDir: `src/templates`,
        templateMap: {
          default: "page",
        },
        orgsys,
      },
    },
    {
      resolve: "gatsby-plugin-local-search",
      options: {
        name: "index",
        engine: "flexsearch",
        engineOptions: "speed",
        query: `
        {
          allMdx(
            filter: { frontmatter: { draft: { ne: true } } }
          ) {
            edges {
              node {
                id
                mdxAST
                frontmatter {
                  title
                  description
                  slug
                  archive
                  draft
                  day: date(formatString: "MMM D")
                  year: date(formatString: "YYYY")
                }
              }
            }
          }
        }
        `,
        ref: "id",
        index: ["title", "description", "searchText"],
        store: ["title", "slug", "archive", "draft", "day", "year"],
        normalizer: ({
          data: {
            allMdx: { edges },
          },
        }) =>
          edges.map(
            ({
              node: {
                id,
                mdxAST,
                frontmatter: {
                  title,
                  description,
                  slug,
                  archive,
                  draft,
                  day,
                  year,
                },
              },
            }) => ({
              id,
              title,
              description,
              slug,
              archive,
              draft,
              day,
              year,
              searchText: getSearchText(mdxAST),
            })
          ),
      },
    },
    {
      resolve: `gatsby-plugin-goatcounter`,
      options: {
        code: "sanyamkapoor",
        exclude: [],
        pageTransitionDelay: 0,
        head: false,
        pixel: false,
        allowLocal: false,
        localStorageKey: "skipgc",
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Sanyam Kapoor`,
        short_name: `Sanyam Kapoor`,
        start_url: `/`,
        background_color: `white`,
        theme_color: `#426bb3`,
        display: `standalone`,
        icon: `static/images/icon.png`,
      },
    },
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-theme-ui`,
    `gatsby-plugin-offline`,
    `gatsby-plugin-netlify`,
  ],
}
