FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /scr

COPY ["HomeBudget.Components.CurrencyRates.Tests/*.csproj", "HomeBudget.Components.CurrencyRates.Tests/"]
COPY ["HomeBudget.Components.CurrencyRates/*.csproj", "HomeBudget.Components.CurrencyRates/"]
COPY ["HomeBudget.DataAccess/*.csproj", "HomeBudget.DataAccess/"]
COPY ["HomeBudget.Core/*.csproj", "HomeBudget.Core/"]
COPY ["HomeBudget-Web-API/*.csproj", "HomeBudget-Web-API/"]
COPY ["HomeBudget.DataAccess.Dapper/*.csproj", "HomeBudget.DataAccess.Dapper/"]
COPY ["docker-compose.dcproj", "."]

COPY . .

RUN dotnet restore ./HomeBudget-Web-API.sln

ARG SONAR_TOKEN
ENV SONAR_TOKEN=${SONAR_TOKEN}

RUN wget https://packages.microsoft.com/config/debian/11/packages-microsoft-prod.deb -O packages-microsoft-prod.deb 
RUN dpkg -i packages-microsoft-prod.deb 
RUN rm packages-microsoft-prod.deb 

RUN apt-get install -y apt-transport-https && \
    apt-get update && \
    apt-get install -y openjdk-11-jdk ant dos2unix ca-certificates-java dotnet-sdk-6.0 && \
    apt-get clean

# Fix certificate issues
RUN update-ca-certificates -f

ENV JAVA_HOME /usr/lib/jvm/java-11-openjdk-amd64/
RUN export JAVA_HOME
RUN export PATH=$PATH:$JAVA_HOME/bin

RUN dotnet new tool-manifest
RUN dotnet tool install dotnet-sonarscanner --tool-path /tools --version 5.5.3
RUN dotnet tool install dotnet-reportgenerator-globaltool --tool-path /tools --version 5.1.4

RUN echo "##vso[task.prependpath]$HOME/.dotnet/tools"
RUN export PATH="$PATH:/root/.dotnet/tools"

RUN /tools/dotnet-sonarscanner begin \
    /o:"allmantool" \
    /k:"Allmantool_h-budget" \
    /v:"${BUILD_VERSION}" \
    /d:sonar.login="${SONAR_TOKEN}" \
    /d:sonar.host.url="https://sonarcloud.io" \
    /d:sonar.coverage.exclusions="**/Test[s]/**/*" \
    /d:sonar.coverageReportPaths="/app/testresults/coverage/reports/SonarQube.xml" \
    /d:sonar.cs.opencover.reportsPaths="/app/testresults/coverage/reports/currencyRates.coverage.xml"

RUN dotnet build HomeBudget-Web-API.sln --no-restore -c Release -o /app/build

LABEL build_version="${BUILD_VERSION}"
LABEL service=CurrencyRatesService

RUN dotnet test HomeBudget-Web-API.sln \
    --logger "trx" \
    --results-directory "/app/testresults/coverage" \
    --collect:"XPlat Code Coverage" \
    /p:CollectCoverage=true \
    /p:CoverletOutputFormat=opencover \
    /p:CoverletOutput="/app/testresults/coverage/currencyRates.coverage.xml" 

RUN /tools/reportgenerator \
    -reports:'/app/testresults/coverage/**/coverage.cobertura.xml;app/testresults/coverage/currencyRates.coverage.xml' \
    -targetdir:'/app/testresults/coverage/reports' \
    -reporttypes:'SonarQube;Cobertura'

RUN /tools/dotnet-sonarscanner end /d:sonar.login="${SONAR_TOKEN}"

FROM build AS publish
RUN dotnet publish "HomeBudget-Web-API.sln" \
          --no-dependencies \
          --no-restore \
          --framework net6.0 \
          -c Release \
          -v Diagnostic \
          -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "HomeBudget-Web-API.dll"]