class Edsa::App < Sinatra::Base
  # Filters
  before do
    if request.path.match /.+\/$/
      redirect request.path.sub(/\/$/, ''), 301
    end
  end

  # Routes
  get '/' do
    erb :index
  end

  get '/:anchor_type/:anchor_number' do
    raise Sinatra::NotFound unless request.path_info.match(/(lim|par|chap)\/([0-9]+)$/)
    erb :index
  end

  # Errors
  not_found do
    erb :'404'
  end
end
