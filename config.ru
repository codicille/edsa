require File.expand_path('../config/application',  __FILE__)

use Rack::Deflater

# Sprockets
map '/assets' do
  Assets = Sprockets::Environment.new

  Assets.append_path 'app/assets/images'
  Assets.append_path 'app/assets/javascripts'
  Assets.append_path 'app/assets/stylesheets'

  if ENV['RACK_ENV'] != 'development'
    Assets.js_compressor = Uglifier.new(mangle: true)
  end

  run Assets
end

# Main application
map '/' do
  run Edsa::App
end
