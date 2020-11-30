const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CspHtmlWebpackPlugin = require("csp-html-webpack-plugin");

const path = require("path");

module.exports = {
  target: "web", // Our app can run without electron
  entry: ["./app/src/index.jsx"], // The entry point of our app; these entry points can be named and we can also have multiple if we'd like to split the webpack bundle into smaller files to improve script loading speed between multiple pages of our app
  output: {
    path: path.resolve(__dirname, "app/dist"), // Where all the output files get dropped after webpack is done with them
    filename: "bundle.js" // The name of the webpack bundle that's generated
  },
  module: {
    rules: [
      {
        // loads .html files
        test: /\.(html)$/,
        include: [path.resolve(__dirname, "app/src")],
        use: {
          loader: "html-loader",
          options: {
            attributes: {
              "list": [{
                "tag": "img",
                "attribute": "data-src",
                "type": "src"
              }]
            }
          }
        }
      },
      // loads .js/jsx files
      {
        test: /\.jsx?$/,
        include: [path.resolve(__dirname, "app/src")],
        loader: "babel-loader",
        resolve: {
          extensions: [".js", ".jsx", ".json"]
        }
      },
      // loads .css files
      {
        test: /\.css$/,
        include: [path.resolve(__dirname, "app/src")],
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader"
          }
        ],
        resolve: {
          extensions: [".css"]
        }
      },
      // loads common image formats
      {
        test: /\.(eot|woff|woff2|ttf|svg|png|jpg|gif)$/,
        use: "url-loader"
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new CspHtmlWebpackPlugin({
      "base-uri": ["'self'"],
      "object-src": ["'none'"],
      "script-src": ["'self'"],
      "style-src": ["'self'",
        "'sha256-AbpHGcgLb+kRsJGnwFEktk7uzpZOCcBY74+YBdrKVGs='", // material-ui style hashes
        "'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='",
        "'sha256-3o6aGi9efyCkMyrM2+XnTSuD7E2AcZqZHx/vJIcMTEk='",
        "'sha256-6y7WJjf5UmqTyodR6qZk7zX4EDmiF+mg2XwcPgt7NsQ='",
        "'sha256-PpoL88sugL+MixGj6eFNM05Q0l/B2tpC9guyJrsQkSY='",
        "'sha256-ZZ/R8st84lV9WrXoYt9iNFYo7gZqyrQd+QnIWYCmjhw='",
        "'sha256-8oQu3cOkcEPQbgEW6XuFmh5d3hFhtkrs45AyatY9jRE='",
        "'sha256-EOmvO8jEWdAcCKkqimNsFzhEhVCAj+b0Stdl4gRcHbo='",
        "'sha256-wdl4nkL/3Epi0a5t7BPoe4E9Lvk2WE4gBgNfo1hUJys='",
        "'sha256-TNucpMncdBIdGN21J1AQ41FTrENVPgFQGmIwT1anmDU='",
        "'sha256-MlG1H2ieI8FYgUeZlEfwURA2tVOOMtyN0sSi0GHcR+g='",
        "'sha256-RURqjol4gFYhOyJYEzKI8rgl3JGRosupgBuat7gzIAI='",
        "'sha256-tekUYy0NkA+O1VOKFNT8dKWreGklo3ejoHu6gC++VBI='",
        "'sha256-daEdpEyAJIa8b2VkCqSKcw8PaExcB6Qro80XNes/sHA='",
        "'sha256-wamdO2J0OzDpJ2zXcODa/9NaCMWSj6Fufy6MM4KqDTU='",
        "'sha256-xhD0kyv/OBbU8qwRcx18eAWFdRtfYbPwMp5gT7FOJts='",
        "'sha256-9TR6AqRSl+XSgzX39kMhJsW4CJwA5uu7gHOQwuM/m2Y='",
        "'sha256-TopuXkdislIiZXCWhypqROJJiUDXDWVRi1eBYR8EGKs='",
        "'sha256-KsmuySVzce1cVtDb+ROyTNAAijBxM/lU1MLFmbFY9kc='",
        "'sha256-ssZ1V1m/8GnwzCnUhoFiI2qDO6B4qjI51G460j8zvrs='",
        "'sha256-kLT9Axv4iArLogUzs03woe6J63c0WhyC7sI/S5Mebf0='",
        "'sha256-hK8cdfoO6hnGwi2anpMkCPNpDZRJVLpvtoda3pEmTL8='",
        "'sha256-JtwMMM1GvjVd/iY2jcraub188Lzd/egIaHTh+z+iY2k='",
        "'sha256-fCf8vYolpye686qbwmcMR0+IrgmySIgcCCdHcsxaNPU='",
        "'sha256-wFQ706AFXKoOPH8j+AaU3eVQaff8LetkfEzm5o1EpHo='",
        "'sha256-ayNONyJFVkqzjpp5z0Opp3grAUOpLTN7rDRy1jrjl0U='",
        "'sha256-0dk/OljC03svd1TX5d2fjadO7ougMn6U7Jw0rNFIUtU='",
        "'sha256-0dk/OljC03svd1TX5d2fjadO7ougMn6U7Jw0rNFIUtU='",
        "'sha256-6V/9yj2KEHP5cUC98VBhLNRGzrh7eVqwLrrbmoLSlnA='",
        "'sha256-poX7b0ZpwtEkVGqPQLJ0SwLkCQOvU+egqj329C9QAO8='",
        "'sha256-QOPudsG8xwkPpa9habxXl8n46jMVXPG/wNZL+aZWJkg='",
        "'sha256-TlHfGHkl+oeErM5WkOz2uzfCWrtkc4VD7naYqUZ34eQ='",
        "'sha256-RYsLyWoOmoE/jSTzcuSILtbGR2QDNiAtXC0xi0UBfrs='",
        "'sha256-fVrX3D5xmCrrt3iqP58Pt2L8PEUWwE4ApxwfAbkAFrc='",
        "'sha256-ILV4B2OtELMM7TNQ6GaaSz1fX1pKXgI3bBsWMESGs1s='",
        "'sha256-2mu914TTreiNh2ST95Fi4ol/mnDn+KQdPrrvGtWB4ug='",
        "'sha256-FPYsi43/LX3nKKMJN5LqNUCFJw51rcHi6IG3QH4bBT8='",
        "'sha256-Q2XZ6zKJviCVVgBVv4+OdQKkKpFT5HUJNQLiLIqDkMw='",
        "'sha256-cZNMZsAAYGLpte4LIzasGRHMXODNfdU6aBF7cyFparU='",
        "'sha256-AvjTyAY5+9QEUKQsZtP3C1ym0d7h5smCSD6K12bJ3as='",
        "'sha256-oM811ON40Uu2IbjaLn0s87hVz+AZpzIM5Txh72C31sI='",
        "'sha256-EL8NABP1DK1Mbnj6NCy63DkQldlLbz93IJqHY8YDT0Y='",
        "'sha256-q70gGDvcktEyMVBn5Ywb6JzlngzB1ITmXyB8kuSqbxs='",
        "'sha256-xr+sqpAWvGZyWXbgAR+oSGFid4ldqvQRloiNxVSLPHY='",
        "'sha256-ELvzld9Py7vFD/JBoVbuEIhEQuQWKtbjSJUeJk8DopA='",
        "'sha256-uUrKtYKX7zySd/OOnzopNg4rN7JqEHrkTnSRH6WXcRU='",
        "'sha256-Qp+e8cz81ng+9G1uLpJrNjBVekaWvCt2ZM+MqPBGXH0='",
        "'sha256-WHRry0MaYK3WlXQxGtu0DrsnFpeo9ePNrLGVD1ngbt4='",
        "'sha256-C9X6+bMRIg5XqBmThFrfn61nsSc8vRtxEFra25DVJTI='"
      ],
      "frame-src": ["'none'"],
      "worker-src": ["'none'"]
    })
  ]
};
