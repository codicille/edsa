# encoding: utf-8

# Command line helpers
def ask(question)
  print "#{question} [Yn]: "
  yield if STDIN.gets.chomp == 'Y'
  puts
end

def prompt(question)
  print "#{question} "
  yield STDIN.gets.chomp
end

def call(command)
  puts "\n=> Running: #{command}"
  system command
end

# Actual task
def deploy!(environment)
  branch = branches[environment]
  return unless call "git push origin #{branch}"

  call "git push #{environment} #{branch}:master --force"
end

def branches
  {'staging' => 'master', 'production' => 'master'}
end

# Rake stuff
namespace :deploy do
  task(:production) { deploy! 'production' }
  task(:staging)    { deploy! 'staging'    }
end

task :deploy do
  prompt 'Which environment you wanna deploy?' do |environment|
    if branches.keys.include? environment
      deploy! environment
    else
      puts "Wut? Dunno about “#{environment}”..."
    end
  end
end
