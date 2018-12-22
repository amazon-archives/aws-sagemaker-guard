/*

Licensed under the Amazon Software License (the "License"). You may not use this file
except in compliance with the License. A copy of the License is located at

http://aws.amazon.com/asl/

or in the "license" file accompanying this file. This file is distributed on an "AS IS"
BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or implied. See the
License for the specific language governing permissions and limitations under the License.
*/
var config=require('../../config')
var CompressionPlugin = require("compression-webpack-plugin")
var path=require('path')
var webpack=require('webpack')
var _=require('lodash')
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const extractSass = new ExtractTextPlugin({
    filename: "[name].css"
});

module.exports={
    entry:{
        app:"./app/index.js",
        vendor:["ajv","csvtojson","elliptic","bn.js"]
    },
    output:{
        path:path.join(__dirname,'../build'),
        filename:"[name].js",
        chunkFilename: '[name].js', 
    },
    plugins:_.compact([
        extractSass,
        new webpack.optimize.CommonsChunkPlugin({
            name:'vendor',
            minChunks(module, count) {
                var context = module.context;
                return context && context.indexOf('node_modules') >= 0;
            }
        })
    ]),
    resolve:{
        alias:{
            vue$:'vue/dist/vue.js',
            querystring: 'querystring-browser'
        }
    },
    module: {
        rules: [
          {
            test: /\.(md|txt)$/,
            loader: 'raw-loader'
          },
          {
            test: /\.vue$/,
            loader: 'vue-loader',
            options: {
              loaders: {
                'scss': 'vue-style-loader!css-loader!sass-loader',
                'sass': 'vue-style-loader!css-loader!sass-loader?indentedSyntax'
              }
            }
          },
          { 
            test: /\.(png|woff|woff2|eot|ttf|svg)$/, 
            loader: 'url-loader?limit=100000' 
          },
          {
            test: /\.pug$/,
            loader: 'pug-loader'
          },
          {
            test: /\.css$/,
            use: ['style-loader','css-loader']
          },
          {
            test: /\.styl$/,
            use: ['style-loader','css-loader','stylus-loader']
          },
          {
            test: /\.scss$/,
            use: extractSass.extract({
                use:[
                    {loader: "css-loader" }, 
                    {loader: "sass-loader" }
                ]
            })
          }
        ]
    }
}
