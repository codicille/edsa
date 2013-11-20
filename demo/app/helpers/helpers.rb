# Assets helpers
def asset_path(file_name)
  if ENV['RACK_ENV'] == 'development'
    file_name = Assets[file_name].logical_path + '?body=1'
  else
    file_name = Assets[file_name].digest_path
  end

  "#{asset_host}/assets/#{file_name}"
end

def dependencies_paths(file_name)
  if ENV['RACK_ENV'] == 'development'
    Assets[file_name].to_a.map { |dep| dep.logical_path + '?body=1' }
  else
    [Assets[file_name].digest_path]
  end
end

def javascript_include_tag(file_name)
  file_name = "#{file_name}.js"
  dependencies_paths(file_name).map { |path| %(<script src="#{asset_host}/assets/#{path}"></script>) }.join
end

def stylesheet_link_tag(file_name)
  file_name = "#{file_name}.css"
  dependencies_paths(file_name).map { |path| %(<link rel="stylesheet" href="#{asset_host}/assets/#{path}">) }.join
end

def inline_script_tag(file_name)
  file_name = "#{file_name}.js"
  '<script>' + Assets[file_name].source + '</script>'
end

def asset_host
  ENV['ASSET_HOST'] || ''
end

# View helpers
def partial(partial, locals={})
  partial_view = "partials/_#{partial}".to_sym
  erb partial_view, :layout => false, locals: locals
end

# URL helpers
def home_path
  '/'
end
